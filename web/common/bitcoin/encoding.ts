// Resources
// https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
// https://bitcoin.stackexchange.com/questions/36634/how-do-i-get-to-the-value-in-the-scriptpubkey-part-of-the-transaction
// https://en.bitcoin.it/wiki/Bech32

import { hexToBytes } from '../utils';
import { decode, encode, convertbits } from './bech32';
import bs58check from 'bs58check'
import { BTC_NETWORK } from '../constants';
import { networks } from 'bitcoinjs-lib';
import { getAddressInfo } from 'bitcoin-address-validation';

export function decodeBtcAddressToBuffer(address: string): Buffer {
  const decoded = decodeBtcAddress(address);
  return Buffer.from(hexToBytes(decoded));
}

export function decodeBtcAddress(address: string): string {
  const info = getAddressInfo(address);

  if (info.bech32) {
    return "0x0014" + bech32Decode(address);
  } else if (info.type == "p2sh") {
    return "0xa914" + base58CheckDecode(address).slice(2) + "87";
  }
  return "0x76a914" + base58CheckDecode(address).slice(2) + "88ac";
}

export function encodeBtcAddress(decodedAddress: string): string {

  if (decodedAddress.startsWith("0x0014")) {
    const stripped = decodedAddress.replace("0x0014", "");
    const address = bech32Encode(BTC_NETWORK.bech32, stripped);
    return address;
  }

  const stripped = decodedAddress.replace("0x76a914", "").replace("88ac", "");
  const version = BTC_NETWORK == networks.bitcoin ? "00" : "6f";
  const address = base58CheckEncode(version + stripped);
  return address;
}

export function bech32Encode(prefix: string, hash: string): string {
  const buffer = Buffer.from(hash, "hex");
  const converted = convertbits(buffer, 8, 5, false)!;
  const encoded = encode(prefix, [0].concat(converted));
  return encoded;
}

export function bech32Decode(address: string): string {
  var decoded = decode(address);
  var converted = convertbits(decoded!.data.slice(1), 5, 8, false)!;

  var array = new Uint8Array(converted.length);
  for (var i = 0; i < converted.length; i++) {
    array[i] = converted[i];
  }
  return Buffer.from(array).toString("hex");
}

export function base58CheckDecode(address: string): string {
  var decoded = bs58check.decode(address)
  return decoded.toString('hex');
}

export function base58CheckEncode(hash: string): string {
  const buffer = Buffer.from(hash, "hex");
  const encoded = bs58check.encode(buffer);
  return encoded;
}
