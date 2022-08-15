import { ECPair, payments, bip32 } from 'bitcoinjs-lib';
import { btcNetwork } from '../constants';

export interface NewWallet {
  address: string,
  publicKey: string,
  privateKey: string | undefined
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

export function createWalletXpub(xpub: string, index: number): NewWallet {
  let pubkey = bip32.fromBase58(xpub).derive(0).derive(index).publicKey;

  const payment = payments.p2wpkh({ 
    pubkey: pubkey,
    network: btcNetwork 
  });

  const result: NewWallet = {
    'address': payment.address!,
    'publicKey': pubkey.toString('hex'),
    'privateKey': undefined
  }
  return result;
}

export function publicKeyToAddress(publicKey: string): string {
  const pair = ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'), { compressed: false });
  const uncompressed = pair.publicKey.toString('hex');
  const { address } = payments.p2pkh({ pubkey: Buffer.from(uncompressed, 'hex'), network: btcNetwork });
  return address as string;
}
