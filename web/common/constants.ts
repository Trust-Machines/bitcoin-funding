import { networks } from 'bitcoinjs-lib';

export let btcNetwork = networks.regtest;
export let btcExplorerUrl = 'http://devnet:devnet@localhost:8001';
export let electrumHost = 'localhost';
export let electrumPort = 50001;

if (process.env.NETWORK === 'mainnet') {
  btcNetwork = networks.bitcoin;
}
