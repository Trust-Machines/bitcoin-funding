import { ECPair, payments, networks } from 'bitcoinjs-lib';
import { btcNetwork } from '../constants';

interface NewWallet {
  address: string | undefined,
  publicKey: string | undefined,
  privateKey: string | undefined
}

export function createWallet(): NewWallet {
  const keyPair = ECPair.makeRandom();
  const payment = payments.p2pkh({ pubkey: keyPair.publicKey, network: btcNetwork });

  const result: NewWallet = {
    'address': payment.address,
    'publicKey': keyPair.publicKey?.toString('hex'),
    'privateKey': keyPair.privateKey?.toString('hex')
  }
  return result;
}
