import axios from 'axios';
import { appApiUrl } from '@/common/constants';

export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  const daoAddress = process.argv.slice(2)[1];
  if (appPrivateKey == undefined) {
    console.log("[FUNDING] Add the user app private key as first parameter")
    return;
  }
  if (daoAddress == undefined) {
    console.log("[FUNDING] Add the DAO address as second parameter")
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

  // Forward to DAO
  const responsseForward = await axios({
    method: 'POST',
    url: appApiUrl + '/user/forward',
    data: {
      appPrivateKey: appPrivateKey,
      daoAddress: daoAddress,
      sats: responseBalance.data
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
