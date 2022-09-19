import { ECPair, payments, bip32 } from 'bitcoinjs-lib';
import { BTC_NETWORK } from '../constants';
import * as bip39 from 'bip39'

export interface NewWallet {
  address: string,
  publicKey: string,
  privateKey: string
}

export function createWallet(): NewWallet {
  const keyPair = ECPair.makeRandom();
  const payment = payments.p2pkh({ pubkey: keyPair.publicKey, network: BTC_NETWORK });

  const result: NewWallet = {
    'address': payment.address!,
    'publicKey': keyPair.publicKey!.toString('hex'),
    'privateKey': keyPair.privateKey!.toString('hex')
  }
  return result;
}

export function createWalletXpub(mnemonic: string, index: number): NewWallet {

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const xpub = bip32.fromSeed(seed, BTC_NETWORK).toBase58();
  const wallet = bip32.fromBase58(xpub, BTC_NETWORK).derive(0).derive(index);

  const payment = payments.p2pkh({ 
    pubkey: wallet.publicKey,
    network: BTC_NETWORK 
  });

  const result: NewWallet = {
    'address': payment.address!,
    'publicKey': wallet.publicKey.toString('hex'),
    'privateKey': wallet.privateKey!.toString('hex')
  }
  return result;
}

export function publicKeyToAddress(publicKey: string): string {
  const pubkey = Buffer.from( publicKey, 'hex' );
  const { address } = payments.p2pkh({ pubkey: pubkey, network: BTC_NETWORK });
  return address as string;
}
