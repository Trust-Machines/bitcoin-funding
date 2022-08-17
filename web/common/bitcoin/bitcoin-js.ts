import { ECPair, payments, bip32 } from 'bitcoinjs-lib';
import { btcNetwork } from '../constants';
import bs58check from 'bs58check';

interface NewWallet {
  address: string | undefined,
  publicKey: string | undefined,
  privateKey: string | undefined
}

export function createWallet(): NewWallet {
  const keyPair = ECPair.makeRandom();
  const payment = payments.p2wpkh({ pubkey: keyPair.publicKey, network: btcNetwork });

  const result: NewWallet = {
    'address': payment.address,
    'publicKey': keyPair.publicKey?.toString('hex'),
    'privateKey': keyPair.privateKey?.toString('hex')
  }
  return result;
}

export function createWalletXpub(xpub: string, index: number): NewWallet {
  let pubkey = bip32.fromBase58(xpub).derive(0).derive(index).publicKey;

  const payment = payments.p2wpkh({ 
    pubkey: pubkey,
    network: btcNetwork 
  });

  const result: NewWallet = {
    'address': payment.address,
    'publicKey': pubkey.toString('hex'),
    'privateKey': undefined
  }
  return result;
}

export function base58CheckEncode(hash: string): string {
  var encoded = bs58check.encode(Buffer.from(hash, 'hex'));
  return encoded;
}

export function base58CheckDecode(address: string): string {
  var decoded = bs58check.decode(address)
  return decoded.toString('hex');
}