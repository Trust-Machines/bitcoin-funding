require('dotenv').config({ path: '../.env' });

import axios from 'axios';
import { appApiUrl } from '../common/constants';
import { registerUser } from '../common/stacks/user-registry-v1-1';

export async function start() {

  // New user forwarding wallet
  const responseWallet = await axios({
    method: 'POST',
    url: appApiUrl + '/user/wallet',
  });
  console.log("[USER] New wallet API response:", responseWallet.data);

  // Link funding wallet on-chain
  const registerResult = await registerUser(responseWallet.data.publicKey);
  const registerTxId = registerResult.txid;
  console.log("[USER] SC registration transaction ID:", registerTxId);

  // New user
  const responseUser = await axios({
    method: 'POST',
    url: appApiUrl + '/user/user',
    data: {
      appPrivateKey: Math.random().toString().replace('.', ''),
      address: process.env.USER_ADDRESS as string,
      registrationTxId: registerTxId
    }
  });
  console.log("[USER] New user API response:", responseUser.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[USER] ERROR:", error);
  }
}
run();
