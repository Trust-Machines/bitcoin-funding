import axios from 'axios';
import { API_URL } from '@/common/constants';
import { parseTx } from '@/common/stacks/clarity-bitcoin';
import Parser from '@dicebear/avatars/dist/parser';

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
    url: API_URL + '/user/balance',
    params: {
      appPrivateKey: appPrivateKey,
    }
  });
  console.log("[FUNDING] Wallet balance:", responseBalance.data);

  // Forward to DAO
  const responsseForward = await axios({
    method: 'POST',
    url: API_URL + '/user/forward',
    headers: { 'Content-Type': 'text/plain' },
    data: JSON.stringify({ 
      appPrivateKey: appPrivateKey,
      daoAddress: daoAddress,
      sats: responseBalance.data
    })
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
