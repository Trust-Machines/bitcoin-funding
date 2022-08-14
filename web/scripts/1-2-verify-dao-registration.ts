require('dotenv').config({ path: '../.env' });

import axios from 'axios';
import { appApiUrl } from '../common/constants';

export async function start() {
  const daoPublicKey = process.argv.slice(2)[0];
  if (daoPublicKey == undefined) {
    console.log("[DAO] Add the DAO public key as parameter")
    return;
  }
  console.log("[DAO] Check SC registration for DAO with public key:", daoPublicKey)

  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/dao/verify',
    data: {
      publicKey: daoPublicKey
    }
  });
  console.log("[DAO] registration verify API result:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[DAO] ERROR:", error);
  }
}
run();
