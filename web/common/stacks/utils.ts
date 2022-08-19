import { stacksApiUrl } from '../constants';
import { base58CheckDecode, hexToBytes } from '../utils';

// TODO: use import
let { bech32 } = require('bech32')

// TODO: move to common/utils
export function decodeBtcAddressToBuffer(address: string) {
  try {
    // Assume Base58 encoding
    const result = hexToBytes(base58CheckDecode(address));
    return Buffer.from(result);
  } catch (e) {
    // Assume BECH32 encoding
    const result = bech32.decode(address);
    return Buffer.from(result.words);
  }
}

export async function getNonce(address: string) {
  const url = `${stacksApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data.nonce;
}

export async function getTransactionInfo(txId: string) {
  const url = `${stacksApiUrl}/extended/v1/tx/${txId}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function getInfo() {
  const url = `${stacksApiUrl}/v2/info`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function getBlockByBurnHeight(burnHeight: number) {
  const url = `${stacksApiUrl}/extended/v1/block/by_burn_block_height/${burnHeight}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}
