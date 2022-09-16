require('dotenv').config({ path: '../../.env' });
import { STACKS_API_URL } from '../constants';
import bcrypt from 'bcrypt'

export async function hashAppPrivateKey(appPrivateKey: string) {
  const hashedAppPrivateKey = await bcrypt.hash(appPrivateKey, process.env.APP_PRIVATE_KEY_SALT as string);
  return hashedAppPrivateKey
}

export async function getNonce(address: string) {
  const url = `${STACKS_API_URL}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data.nonce;
}

export async function getTransactionInfo(txId: string) {
  const url = `${STACKS_API_URL}/extended/v1/tx/${txId}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function getInfo() {
  const url = `${STACKS_API_URL}/v2/info`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function getBlockByBurnHeight(burnHeight: number) {
  const url = `${STACKS_API_URL}/extended/v1/block/by_burn_block_height/${burnHeight}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}

export async function getBlockByHeight(height: number) {
  const url = `${STACKS_API_URL}/extended/v1/block/by_height/${height}`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data;
}
