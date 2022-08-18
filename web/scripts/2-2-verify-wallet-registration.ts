import axios from 'axios';
import { appApiUrl } from '@/common/constants';

export async function start() {
  const appPrivateKey = process.argv.slice(2)[0];
  if (appPrivateKey == undefined) {
    console.log("[USER] Add the user app private key as parameter")
    return;
  }
  console.log("[USER] Check SC registration for user with app private key:", appPrivateKey)

  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/user/verify',
    data: {
      appPrivateKey: appPrivateKey
    }
  });
  console.log("[USER] registration verify API result:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[USER] ERROR:", error);
  }
}
run();
