require('dotenv').config({ path: '../.env' });

import { networks } from 'bitcoinjs-lib';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export let btcNetwork = networks.regtest;
export let btcExplorerUrl = 'http://devnet:devnet@localhost:8001';

export let electrumHost = 'localhost';
export let electrumPort = 50001;

export let stacksNetwork = new StacksTestnet({ url: 'http://localhost:3999' });
export let stacksApiUrl = 'http://localhost:3999';

export let appApiUrl = 'http://localhost:3000/api/'

if (process.env.NETWORK === 'mainnet') {
  btcNetwork = networks.bitcoin;

  stacksNetwork = new StacksMainnet();
  stacksApiUrl = 'https://stacks-node-api.mainnet.stacks.co';
} 
