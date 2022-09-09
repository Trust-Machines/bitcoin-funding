require('dotenv').config({ path: '../.env' });

import { networks } from 'bitcoinjs-lib';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export let BTC_NETWORK = networks.regtest;
export let BTC_EXPLORER_URL = 'http://devnet:devnet@localhost:8001';

export let ELECTRUM_HOST = 'localhost';
export let ELECTRUM_PORT = 50001;

export let STACKS_NETWORK = new StacksTestnet({ url: 'http://localhost:3999' });
export let STACKS_API_URL = 'http://localhost:3999';

if (process.env.NETWORK === 'mainnet') {
  BTC_NETWORK = networks.bitcoin;

  STACKS_NETWORK = new StacksMainnet();
  STACKS_API_URL = 'https://stacks-node-api.mainnet.stacks.co';
} 

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const API_URL = BASE_URL ? `https://${BASE_URL}/api` : 'http://localhost:3000/api';
