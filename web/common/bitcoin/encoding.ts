// Resources
// https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
// https://en.bitcoin.it/wiki/Bech32

import { hexToBytes } from '../utils';
import { decode, encode, convertbits } from './bech32';

// TODO: use import
var bs58check = require('bs58check')

export function decodeBtcAddressToBuffer(address: string): Buffer {
  const decoded = decodeBtcAddress(address);
  return Buffer.from(hexToBytes(decoded));
}

export function decodeBtcAddress(address: string): string {
  if (address.startsWith('bc1') || address.startsWith('tb1') || address.startsWith('bcrt1')) {
    return "0x0014" + bech32Decode(address);
  }
  return "0x" + base58CheckDecode(address);
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

export function base58CheckEncode(hash: string): string {
  var encoded = bs58check.encode(Buffer.from(hash, 'hex'));
  return encoded;
}

export function base58CheckDecode(address: string): string {
  var decoded = bs58check.decode(address)
  return decoded.toString('hex');
}
