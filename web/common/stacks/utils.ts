
import { stacksApiUrl } from '../constants';

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
