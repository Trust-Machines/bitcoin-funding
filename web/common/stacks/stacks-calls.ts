import {
  AnchorMode,
  callReadOnlyFunction,
  cvToJSON,
  bufferCVFromString,
  bufferCV,
  uintCV,
  contractPrincipalCV,
  standardPrincipalCV,
  makeStandardFungiblePostCondition,
  makeStandardSTXPostCondition,
  makeContractFungiblePostCondition,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  createAssetInfo
} from '@stacks/transactions';

import { payments, Psbt, ECPair, networks } from 'bitcoinjs-lib';

import { StacksMainnet, StacksTestnet } from '@stacks/network';

export const stacksNetwork = new StacksTestnet({ url: 'http://localhost:3999' });

export async function parseTx(tx: string) {


  const keyPair = ECPair.makeRandom();
  const payment = payments.p2wpkh({ pubkey: keyPair.publicKey, network: networks.regtest });

  const txHex = makeTxHex(payment, Number(123));

  console.log("txHex: ", txHex);
  console.log("txHex string: ", txHex.toString('hex'));
  console.log("txHex again: ", Buffer.from(txHex.toString('hex'), 'hex'));

  const call = await callReadOnlyFunction({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'clarity-bitcoin',
    functionName: 'parse-tx',
    functionArgs: [
      bufferCV(txHex),
    ],
    senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    network: stacksNetwork,
  });
  const result = cvToJSON(call);

  console.log("result: ", result);

}



export function makeTxHex(payment: payments.Payment, value = 10000) {
  // input data from bitcoinjs-lib tests
  const alice = ECPair.fromWIF('L2uPYXe17xSTqbCjZvL2DsyXPCbXspvcu5mHLDYUgzdUbZGSKrSr');
  const psbt = new Psbt({ network: networks.regtest });
  psbt.addInput({
    hash: '7d067b4a697a09d2c3cff7d4d9506c9955e93bff41bf82d439da7d030382bc3e',
    index: 0,
    nonWitnessUtxo: Buffer.from(
      '0200000001f9f34e95b9d5c8abcd20fc5bd4a825d1517be62f0f775e5f36da944d9' +
        '452e550000000006b483045022100c86e9a111afc90f64b4904bd609e9eaed80d48' +
        'ca17c162b1aca0a788ac3526f002207bb79b60d4fc6526329bf18a77135dc566020' +
        '9e761da46e1c2f1152ec013215801210211755115eabf846720f5cb18f248666fec' +
        '631e5e1e66009ce3710ceea5b1ad13ffffffff01' +
        // value in satoshis (Int64LE) = 0x015f90 = 90000
        '905f010000000000' +
        // scriptPubkey length
        '19' +
        // scriptPubkey
        '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac' +
        // locktime
        '00000000',
      'hex'
    ),
  });
  psbt.addOutput({
    address: payment.address!,
    value,
  });
  psbt.signInput(0, alice);
  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toBuffer();
  return txHex;
}
