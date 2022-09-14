import { ElectrumClient } from "@samouraiwallet/electrum-client";
import { ECPair, payments, Psbt } from 'bitcoinjs-lib';
import { bytesToHex } from 'micro-stacks/common';
import { getScriptHash, reverseBuffer } from './electrum-utils'
import { BTC_NETWORK, ELECTRUM_HOST, ELECTRUM_PORT } from '../constants';
import { getBlockByBurnHeight, getBlockByHeight, getInfo } from "../stacks/utils";

interface BtcBalance {
  unconfirmed: number,
  confirmed: number
}

interface UnspentObject {
  tx_hash: string,
  tx_pos: number,
  height: number,
  value: number
}

interface TransactionObject {
  txid: string,
  hex: string
}

async function newElectrumClient(): Promise<ElectrumClient> {
  const client = new ElectrumClient(ELECTRUM_PORT, ELECTRUM_HOST, 'tcp');
  await client.initElectrum({client: 'electrum-client-js', version: ['1.2', '1.4']}, {
      retryPeriod: 5000,
      maxRetry: 10,
      pingPeriod: 5000,
  });
  return client;
}

export async function getBalance(address: string): Promise<number> {
  const client = await newElectrumClient();

  const user = payments.p2pkh({
    address: address,
    network: BTC_NETWORK,
  });
  const scriptHash = getScriptHash(user.output!);
  const unspents = await client.blockchainScripthash_listunspent(bytesToHex(scriptHash)) as [UnspentObject];
  if (!unspents.length) {
    return 0;
  }
  const unspent = unspents.sort((a, b) => (a.value < b.value ? 1 : -1))[0];
  return unspent.value;
}

export async function getEstimatedFee(): Promise<number> {
  const client = await newElectrumClient();

  // Get estimated fee to be confirmed in 1 block
  const estimatedFee = await client.blockchainEstimatefee(1);
  const estimatedFeeSats = Math.ceil(parseFloat(estimatedFee as string) * 100000000);  

  // Get relay fee
  const relayFee = await client.blockchain_relayfee();
  const relayFeeSats = Math.ceil(parseFloat(relayFee as string) * 100000000); 
  
  // Min relay fee
  const minimumFeeSats = 1000;

  // In production the estimation should always return a correct number
  // In dev the estimations only start working after some txs have been made
  if (estimatedFeeSats < minimumFeeSats && relayFeeSats < minimumFeeSats) {
    return minimumFeeSats;
  } else if (estimatedFeeSats < relayFeeSats) {
    return relayFeeSats;
  }
  return estimatedFeeSats;
}

export async function sendBtc(senderPrivateKey: string, receiverAddress: string, amount: number): Promise<string> {
  const client = await newElectrumClient();

  const signer = ECPair.fromPrivateKey(Buffer.from(senderPrivateKey, 'hex'), { network: BTC_NETWORK });
  const sender = payments.p2pkh({
    pubkey: signer.publicKey,
    network: BTC_NETWORK,
  });
  const senderAddress = sender.address!;
  const scriptHash = getScriptHash(sender.output!);
  const unspents = await client.blockchainScripthash_listunspent(bytesToHex(scriptHash)) as [UnspentObject];
  const unspent = unspents.sort((a, b) => (a.value < b.value ? 1 : -1))[0];
  const tx = await client.blockchainTransaction_get(unspent.tx_hash, true) as TransactionObject;
  const txHex = Buffer.from(tx.hex, 'hex');

  const psbt = new Psbt({ network: BTC_NETWORK });
  psbt.addInput({
    hash: unspent.tx_hash,
    index: unspent.tx_pos,
    nonWitnessUtxo: txHex,
  });

  // Get estimated fee
  const fee = await getEstimatedFee();

  // When parsing a BTC transaction in clarity, we can only check the addresses of the outputs and not inputs.
  // So we need to make sure the sender is also added as output.
  // If we forward all funds, the sender can not be added as output. So we need to keep some dust.
  const actualAmount = amount - fee;
  const senderValueLeft = unspent.value - amount;
  const dust = senderValueLeft == 0 ? 500 : 0;

  psbt.addOutput({
    address: senderAddress,
    value: senderValueLeft + dust,
  });
  psbt.addOutput({
    address: receiverAddress,
    value: actualAmount - dust,
  });

  psbt.signAllInputs(signer);
  psbt.finalizeAllInputs();
  const finalTx = psbt.extractTransaction(true);
  const txid = await client.blockchainTransaction_broadcast(finalTx.toHex()) as string;
  return txid;
}

export async function getTransactionHex(txId: string): Promise<any> {
  const client = await newElectrumClient();
  const tx = await client.blockchainTransaction_get(txId, true) as any;
  return tx.hex;
}

export async function getTransactionData(txId: string, senderAddress: string, receiverAddress: string): Promise<any> {
  const client = await newElectrumClient();
  const tx = await client.blockchainTransaction_get(txId, true) as any;

  // Block info
  const stacksInfo = await getInfo();
  const burnHeight = stacksInfo.burn_block_height - tx.confirmations + 1;
  const { header, stacksHeight, prevBlocks } = await stacksBlockAtBurnHeight(burnHeight);

  // Proof info
  const merkle = await client.blockchainTransaction_getMerkle(txId, burnHeight) as any;
  const merkleHashes = merkle.merkle as string[];
  const proofTxIndex = merkle.pos;
  const proofTreeDepth = merkleHashes.length;
  const proofHashes = merkleHashes.map(hash => bytesToHex(reverseBuffer(Buffer.from(hash, 'hex'))));

  const vout = tx.vout as any[];
  const senderIndex = vout.findIndex(vout => {
    const addressesMatch = vout.scriptPubKey.addresses?.[0] === senderAddress;
    const addressMatch = vout.scriptPubKey.address === senderAddress;
    return addressMatch || addressesMatch;
  });
  const receiverIndex = vout.findIndex(vout => {
    const addressesMatch = vout.scriptPubKey.addresses?.[0] === receiverAddress;
    const addressMatch = vout.scriptPubKey.address === receiverAddress;
    return addressMatch || addressesMatch;
  });

  // Return all info
  return {
    blockHeader: header,
    blockHeight: stacksHeight,
    prevBlocks: prevBlocks,
    txHex: tx.hex,
    proofTxIndex: proofTxIndex,
    proofHashes: proofHashes,
    proofTreeDepth: proofTreeDepth,
    senderIndex: senderIndex,
    receiverIndex: receiverIndex,
  }
}

async function stacksBlockAtBurnHeight(burnHeight: number): Promise<any> {
  const client = await newElectrumClient();

  // Get stacks block height, given burn block height
  // This stacks block height might not be linked to the given burn height
  const stacksBlock = await getBlockByBurnHeight(burnHeight); 
  const stacksHeight = stacksBlock.height;

  // Now find the actual burn block height, for the stacks block height
  const stacksBurnHeight = await getBlockByHeight(stacksHeight);
  const actualBurnHeight = stacksBurnHeight.burn_block_height;

  // Header info for burn block height for the stacks block
  const headerInfo = await client.blockchainBlock_headers(actualBurnHeight, 1) as any;
  const header = headerInfo.hex as string;

  // BTC transaction might be included in a previous block, 
  // which did not have a stacks block
  var prevBlocks: string[] = [];
  for (let height = burnHeight; height < parseInt(actualBurnHeight); height++) {
    const prevHeaderInfo = await client.blockchainBlock_headers(height, 1) as any;
    prevBlocks.unshift(prevHeaderInfo.hex as string)
  }

  return {
    header,
    stacksHeight,
    prevBlocks
  };
}
