import { BTC_EXPLORER_URL } from "./constants";

export function hexToBytes(hex: string): Uint8Array {
	return hexToBytesHelper(hex.substring(0, 2) === '0x' ? hex.substring(2) : hex);
}

function hexToBytesHelper(hex: string): Uint8Array {
  if (typeof hex !== 'string')
    throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
  if (hex.length % 2)
    throw new Error(`hexToBytes: received invalid unpadded hex, got: ${hex.length}`);
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    array[i] = Number.parseInt(hex.slice(j, j + 2), 16);
  }
  return array;
}

export function dollarAmountToString(amount: number): string {
  return "$" + amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function dateToString(date: Date, showTime: boolean = true): string {
  const yearPart = date.toString().split("T")[0].split("-")[0];
  const monthPart = date.toString().split("T")[0].split("-")[1];
  const dayPart = date.toString().split("T")[0].split("-")[2];
  const hoursPart = date.toString().split("T")[1].split(":")[0];
  const minutesPart = date.toString().split("T")[1].split(":")[1];
  if (!showTime) {
    return dayPart + "-" + monthPart  + "-" + yearPart;
  }
  return hoursPart + ":" + minutesPart + " " + dayPart + "-" + monthPart  + "-" + yearPart;
}

export function daysToDate(date: Date): number {
  let now = new Date();
  let deadline = new Date(date);
  let difference = deadline.getTime() - now.getTime();
  let days = Math.ceil(difference / (1000 * 3600 * 24));
  return days;
}

export function shortAddress(address: string): string {
  return `${address.substring(0, 5)}...${address.substring(address.length, address.length - 5)}`;
}

export function stacksExplorerLinkTx(txId: string) {
  const chain = process.env.NEXT_PUBLIC_NETWORK;
  if (chain == "mocknet") {
    return `http://localhost:3999/extended/v1/tx/${txId}`
  }
  return `https://explorer.stacks.co/txid/${txId}?chain=${chain}`
}

export function bitcoinExplorerLinkTx(txId: string) {
  return `${BTC_EXPLORER_URL}/tx/${txId}`
}

export function bitcoinExplorerLinkAddress(address: string) {
  return `${BTC_EXPLORER_URL}/address/${address}`
}

