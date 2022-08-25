import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { addUserFunding } from '@/common/stacks/dao-funding-v1-1';

export async function start() {
  const txId = process.argv.slice(2)[0];
  if (txId == undefined) {
    console.log("[FUNDING] Add transaction ID as parameter");
    return;
  }

  const responseTxInfo = await axios({
    method: 'POST',
    url: appApiUrl + '/transaction/verify',
    data: {
      txId: txId
    }
  });
  const txInfo = responseTxInfo.data;
  console.log("[FUNDING] Transaction parsed verification:", txInfo);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[FUNDING] ERROR:", error);
  }
}
run();
