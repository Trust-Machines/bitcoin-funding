import { ECPair, payments } from 'bitcoinjs-lib';

export function createWallet(): string | undefined {
  const keyPair = ECPair.makeRandom();
  const payment = payments.p2pkh({ pubkey: keyPair.publicKey });
  return payment.address;
}
