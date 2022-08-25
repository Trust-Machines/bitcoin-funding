import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { registerUser } from '@/common/stacks/user-registry-v1-1';

export async function start() {

  // New user forwarding wallet
  const responseWallet = await axios({
    method: 'POST',
    url: appApiUrl + '/wallet/create',
  });
  console.log("[USER] New wallet API response:", responseWallet.data);

  // Link funding wallet on-chain
  const registerResult = await registerUser(responseWallet.data.address);
  const registerTxId = registerResult.txid;
  console.log("[USER] SC registration transaction ID:", registerTxId);

  // Create dehydratedState
  const dehydratedState = [
    [1,"https://stacks-node-api.mainnet.stacks.co"],
    [0,
      [{
        "appPrivateKey": Math.random().toString().replace('.', ''),
        "address": process.env.USER_ADDRESS as string,
        "profile_url":"https://gaia.blockstack.org/hub/17ZjK2Ssx2dYpBejTmDG8HBVbPXp8ZmQUC/profile.json"
      }]
    ],1
  ];
  const dehydratedStateString = JSON.stringify(dehydratedState);

  // New user
  const responseUser = await axios({
    method: 'POST',
    url: appApiUrl + '/session/save',
    data: {
      dehydratedState: dehydratedStateString,
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
