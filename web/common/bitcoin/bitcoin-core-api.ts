import { btcExplorerUrl } from '../constants';

export async function getCurrentBlockHeight(): Promise<Number> {
  const url = `${btcExplorerUrl}/api/blocks/tip/height`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return data;
}

export async function getBlockInfo(blockHeight: Number): Promise<any> {
  const url = `${btcExplorerUrl}/api/block/${blockHeight}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return data;
}

export async function getTransactionInfo(tx: string): Promise<any> {
  const url = `${btcExplorerUrl}/api/tx/${tx}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return data;
}
