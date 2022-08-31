import { stacksApiUrl } from '../constants';
import bcrypt from 'bcrypt'

export async function hashAppPrivateKey(appPrivateKey: string) {
  const hashedAppPrivateKey = await bcrypt.hash(appPrivateKey, process.env.APP_PRIVATE_KEY_SALT as string);
  return hashedAppPrivateKey
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
