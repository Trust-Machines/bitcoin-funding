require('dotenv').config({ path: '../../.env' });

import { networks } from 'bitcoinjs-lib';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export let BTC_NETWORK = networks.regtest;
export let BTC_EXPLORER_URL = 'http://devnet:devnet@localhost:8001';

export let ELECTRUM_HOST = 'localhost';
export let ELECTRUM_PORT = 50001;

export let STACKS_NETWORK = new StacksTestnet({ url: 'http://localhost:3999' });
export let STACKS_API_URL = 'http://localhost:3999';

export let API_URL = 'http://localhost:3000/api';

if (process.env.NEXT_PUBLIC_NETWORK === 'mainnet') {
  BTC_NETWORK = networks.bitcoin;
  BTC_EXPLORER_URL = 'https://mempool.space';

  ELECTRUM_HOST = 'xtrum.com';
  ELECTRUM_PORT = 50001;

  STACKS_NETWORK = new StacksMainnet();
  STACKS_API_URL = 'https://stacks-node-api.mainnet.stacks.co';

  API_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api';

} else if (process.env.NEXT_PUBLIC_NETWORK === 'testnet') {

  BTC_NETWORK = networks.testnet;
  BTC_EXPLORER_URL = 'https://mempool.space/testnet';

  ELECTRUM_HOST = 'blackie.c3-soft.com';
  ELECTRUM_PORT = 57005;

  STACKS_NETWORK = new StacksTestnet({ url: 'https://stacks-node-api.testnet.stacks.co' });
  STACKS_API_URL = 'https://stacks-node-api.testnet.stacks.co';

  API_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api';
}
