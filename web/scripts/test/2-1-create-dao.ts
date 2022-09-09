import axios from 'axios';
import { createWallet } from '@/common/bitcoin/bitcoin-js';
import { getDaoCount } from "@/common/stacks/dao-registry-v1-1"
import { appApiUrl } from '@/common/constants';
import FormData from 'form-data';
import { User } from '@prisma/client';


export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  if (appPrivateKey == undefined) {
    console.log("[DAO] Add the creator app private key as parameter")
    return;
  }

  // Number of registered DAOs
  const daoCount = await getDaoCount();
  console.log("[DAO] Total number of DAOs in SC:", daoCount);

  // New DAO wallet
  const daoWallet = createWallet();
  console.log("[DAO] New DAO wallet:", daoWallet);

  // Get user
  const user = (await axios({
    method: 'GET',
    url: appApiUrl + '/user/info?appPrivateKey=' + appPrivateKey,
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
  formData.append("address", daoWallet.address);
  formData.append("name", "DAO #" + daoCount);
  formData.append("about", "A great DAO");
  formData.append("raisingAmount", (10 * 100000000).toString()); // in sats
  formData.append("raisingDeadline", "01/01/2023");
  formData.append("dehydratedState", dehydratedStateString);

  // Register DAO with API
  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/dao/create',
    data: formData
  });
  console.log("[DAO] Registration API response:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[DAO] ERROR:", error);
  }
}
run();
