import axios from 'axios';
import { createWallet } from '@/common/bitcoin/bitcoin-js';
import { getFundCount } from "@/common/stacks/fund-registry-v1-1"
import { API_URL } from '@/common/constants';
import FormData from 'form-data';
import { User } from '@prisma/client';


export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  if (appPrivateKey == undefined) {
    console.log("[FUND] Add the creator app private key as parameter")
    return;
  }

  // Number of registered Funds
  const fundCount = await getFundCount();
  console.log("[FUND] Total number of funds in SC:", fundCount);

  // New Fund wallet
  const fundWallet = createWallet();
  console.log("[FUND] New fund wallet:", fundWallet);

  // Get user
  const user = (await axios({
    method: 'GET',
    url: API_URL + '/user/info?appPrivateKey=' + appPrivateKey,
  })).data as User;

  // Create dehydratedState
  const dehydratedState = [
    [1,"https://stacks-node-api.mainnet.stacks.co"],
    [0,
      [{
        "appPrivateKey": appPrivateKey,
        "address": user.address,
        "profile_url":"https://gaia.blockstack.org/hub/17ZjK2Ssx2dYpBejTmDG8HBVbPXp8ZmQUC/profile.json"
      }]
    ],1
  ];
  const dehydratedStateString = JSON.stringify(dehydratedState);

  // Form data
  const formData = new FormData();
  formData.append("address", fundWallet.address);
  formData.append("name", "Fund #" + fundCount);
  formData.append("about", "A great fund");
  formData.append("raisingAmount", (10 * 100000000).toString()); // in sats
  formData.append("raisingDeadline", "01/01/2023");
  formData.append("dehydratedState", dehydratedStateString);

  // Register fund with API
  const response = await axios({
    method: 'POST',
    url: API_URL + '/fund/create',
    data: formData
  });
  console.log("[FUND] Registration API response:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[FUND] ERROR:", error);
  }
}
run();
