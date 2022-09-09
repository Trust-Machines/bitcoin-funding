import axios from 'axios';
import { appApiUrl } from '@/common/constants';

export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  if (appPrivateKey == undefined) {
    console.log("[USER] Add the user app private key as parameter")
    return;
  }

  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/user/register',
    headers: { 'Content-Type': 'text/plain' },
    data: JSON.stringify({ appPrivateKey: appPrivateKey })
  });
  console.log("[USER] registration API result:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[USER] ERROR:", error);
  }
}
run();
