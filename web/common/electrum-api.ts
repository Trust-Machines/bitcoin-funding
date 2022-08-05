import {ElectrumClient} from "@samouraiwallet/electrum-client";
import { address as btcAddress } from 'bitcoinjs-lib';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { ECPair, payments, networks, Psbt } from 'bitcoinjs-lib';
import {
  bytesToHex,
  IntegerType,
  intToHexString,
  hexToBytes,
  utf8ToBytes,
} from 'micro-stacks/common';


interface BtcBalance {
  unconfirmed: number,
  confirmed: number
}

interface UnspentElement {
  tx_hash: string,
  tx_pos: number,
  height: number,
  value: number
}


export async function getBalance(address: string): Promise<string> {
  
  const client = new ElectrumClient(50001, 'localhost', 'tcp');

  await client.initElectrum({client: 'electrum-client-js', version: ['1.2', '1.4']}, {
      retryPeriod: 5000,
      maxRetry: 10,
      pingPeriod: 5000,
  });

  const btcNetwork = networks.regtest;

  const output = btcAddress.toOutputScript(address, btcNetwork);
  const scriptHash = getScriptHash(output);
  const balances = await client.blockchainScripthash_getBalance(bytesToHex(scriptHash)) as BtcBalance;
  const balance = BigInt(balances.unconfirmed) + BigInt(balances.confirmed);
  
  console.log("balances:", balances);

  return balance.toString();
}

export async function listUnspent(address: string): Promise<string> {

  const client = new ElectrumClient(50001, 'localhost', 'tcp');

  await client.initElectrum({client: 'electrum-client-js', version: ['1.2', '1.4']}, {
      retryPeriod: 5000,
      maxRetry: 10,
      pingPeriod: 5000,
  });

  const btcNetwork = networks.regtest;

  const output = btcAddress.toOutputScript(address, btcNetwork);
  const scriptHash = getScriptHash(output);

  const listUnspent = await client.blockchainScripthash_listunspent(bytesToHex(scriptHash));

  console.log("listUnspent:", listUnspent);

  return "oki"

}

export async function sendBtc(): Promise<string> {


  const receiverAddress = "n2v875jbJ4RjBnTjgbfikDfnwsDV5iUByw";

  const pk = "28e105d8e3c8cf5d81137779b4c8c946291393fb001daeb8e6dc7393b9fa94b6";



  const client = new ElectrumClient(50001, 'localhost', 'tcp');

  await client.initElectrum({client: 'electrum-client-js', version: ['1.2', '1.4']}, {
      retryPeriod: 5000,
      maxRetry: 10,
      pingPeriod: 5000,
  });



  // const signer = ECPair.fromWIF(Buffer.from(pk, 'hex'), networks.regtest);
    const signer = ECPair.fromPrivateKey(Buffer.from(pk, 'hex'), { network: networks.regtest });

  const sender = payments.p2pkh({
    pubkey: signer.publicKey,
    network: networks.regtest,
  });
  const senderAddress = sender.address!;
  const scriptHash = getScriptHash(sender.output!);

  const unspents = await client.blockchainScripthash_listunspent(bytesToHex(scriptHash)) as [UnspentElement];
  const unspent = unspents.sort((a, b) => (a.value < b.value ? 1 : -1))[0];
  const tx = await client.blockchainTransaction_get(unspent.tx_hash, true);

  console.log("tx test: ", tx);

  const txHex = Buffer.from(tx.hex, 'hex');

  const psbt = new Psbt({ network: networks.regtest });
  const faucetAmount = 1234567;
  const fee = 500;

  psbt.addInput({
    hash: unspent.tx_hash,
    index: unspent.tx_pos,
    nonWitnessUtxo: txHex,
  });

  psbt.addOutput({
    address: senderAddress,
    value: unspent.value - faucetAmount - fee,
  });
  psbt.addOutput({
    address: receiverAddress,
    value: faucetAmount,
  });

  psbt.signAllInputs(signer);
  psbt.finalizeAllInputs();
  const finalTx = psbt.extractTransaction(true);
  const txid = await client.blockchainTransaction_broadcast(finalTx.toHex());

  console.log("txid: ", txid);

  return "yes";
}






export type BufferType = Buffer | Uint8Array;


export function getScriptHash(output: BufferType): Uint8Array {
  const uintOutput = Uint8Array.from(output);
  const hash = hashSha256(uintOutput);
  const reversed = reverseBuffer(Buffer.from(hash));
  return reversed;
}

export function reverseBuffer(buffer: BufferType): Uint8Array {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return Uint8Array.from(buffer);
}