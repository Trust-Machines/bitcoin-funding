require('dotenv').config({ path: '../.env' });

import axios from 'axios';
import { appApiUrl } from '../common/constants';
import { publicKeyToAddress } from '../common/bitcoin/bitcoin-js'

export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  const daoPublicKey = process.argv.slice(2)[1];
  if (appPrivateKey == undefined) {
    console.log("[FUNDING] Add the user app private key as first parameter")
    return;
  }
  if (daoPublicKey == undefined) {
    console.log("[FUNDING] Add the DAO public key as second parameter")
    return;
  }

  // Check wallet balance
  const responseBalance = await axios({
    method: 'GET',
    url: appApiUrl + '/user/balance',
    params: {
      appPrivateKey: appPrivateKey,
    }
  });
  console.log("[FUNDING] Wallet balance:", responseBalance.data);

  // Get DAO address from public key
  const daoAddress = publicKeyToAddress(daoPublicKey);
  console.log("[FUNDING] DAO address:", daoAddress);

  // Forward to DAO
  const responsseForward = await axios({
    method: 'POST',
    url: appApiUrl + '/user/forward',
    data: {
      appPrivateKey: appPrivateKey,
      daoAddress: daoAddress,
      // sats: responseBalance.data
      sats: 1000
    }
  });
  console.log("[FUNDING] Forward API response:", responsseForward.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[FUNDING] ERROR:", error);
  }
}
run();
