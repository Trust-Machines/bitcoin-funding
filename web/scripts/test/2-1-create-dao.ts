import axios from 'axios';
import { createWallet } from '@/common/bitcoin/bitcoin-js';
import { getFundCount } from "@/common/stacks/Fund-registry-v1-1"
import { API_URL } from '@/common/constants';
import FormData from 'form-data';
import { User } from '@prisma/client';


export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  if (appPrivateKey == undefined) {
    console.log("[Fund] Add the creator app private key as parameter")
    return;
  }

  // Number of registered Funds
  const FundCount = await getFundCount();
  console.log("[Fund] Total number of Funds in SC:", FundCount);

  // New Fund wallet
  const FundWallet = createWallet();
  console.log("[Fund] New Fund wallet:", FundWallet);

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
  formData.append("address", FundWallet.address);
  formData.append("name", "Fund #" + FundCount);
  formData.append("about", "A great fund");
  formData.append("raisingAmount", (10 * 100000000).toString()); // in sats
  formData.append("raisingDeadline", "01/01/2023");
  formData.append("dehydratedState", dehydratedStateString);

  // Register Fund with API
  const response = await axios({
    method: 'POST',
    url: API_URL + '/Fund/create',
    data: formData
  });
  console.log("[Fund] Registration API response:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[Fund] ERROR:", error);
  }
}
run();
