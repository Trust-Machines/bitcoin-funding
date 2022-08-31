import { ECPair, payments, bip32 } from 'bitcoinjs-lib';
import { btcNetwork } from '../constants';
import * as bip39 from 'bip39'

export interface NewWallet {
  address: string,
  publicKey: string,
  privateKey: string
}

export function createWallet(): NewWallet {
  const keyPair = ECPair.makeRandom();
  const payment = payments.p2wpkh({ pubkey: keyPair.publicKey, network: btcNetwork });

  const result: NewWallet = {
    'address': payment.address!,
    'publicKey': keyPair.publicKey!.toString('hex'),
    'privateKey': keyPair.privateKey!.toString('hex')
  }
  return result;
}

export function createWalletXpub(mnemonic: string, index: number): NewWallet {

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const xpub = bip32.fromSeed(seed, btcNetwork).toBase58();
  const wallet = bip32.fromBase58(xpub, btcNetwork).derive(0).derive(index);

  const payment = payments.p2wpkh({ 
    pubkey: wallet.publicKey,
    network: btcNetwork 
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
  const { address } = payments.p2wpkh({ pubkey: pubkey, network: btcNetwork });
  return address as string;
}
