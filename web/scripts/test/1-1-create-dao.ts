import axios from 'axios';
import { createWallet } from '@/common/bitcoin/bitcoin-js';
import { getDaoCount } from "@/common/stacks/dao-registry-v1-1"
import { appApiUrl } from '@/common/constants';

export async function start() {

  // Number of registered DAOs
  const daoCount = await getDaoCount();
  console.log("[DAO] Total number of DAOs in SC:", daoCount);

  // New DAO wallet
  const daoWallet = createWallet();
  console.log("[DAO] New DAO wallet:", daoWallet);

  // Register DAO with API
  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/dao/create',
    data: {
      address: daoWallet.address,
      name: "DAO #" + daoCount,
      about: "A great DAO",
      raisingAmount: 10 * 100000000,  // in sats
      raisingDeadline: "01/01/2023"
    }
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
