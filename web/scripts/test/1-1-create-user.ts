require('dotenv').config({ path: '../../.env' });
import axios from 'axios';
import { API_URL } from '@/common/constants';

const userAddress = process.env.USER_ADDRESS as string;

export async function start() {

  // Create dehydratedState
  const dehydratedState = [
    [1,"https://stacks-node-api.mainnet.stacks.co"],
    [0,
      [{
        "appPrivateKey": Math.random().toString().replace('.', ''),
        "address": userAddress,
        "profile_url":"https://gaia.blockstack.org/hub/17ZjK2Ssx2dYpBejTmDG8HBVbPXp8ZmQUC/profile.json"
      }]
    ],1
  ];
  const dehydratedStateString = JSON.stringify(dehydratedState);

  // New user
  const responseUser = await axios({
    method: 'POST',
    url: API_URL + '/session/save',
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
