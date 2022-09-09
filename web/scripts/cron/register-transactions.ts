import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { FundingTransaction } from '@prisma/client';

export async function start() {

  // Get unregistered
  const unregistered = (await axios({
    method: 'GET',
    url: appApiUrl + '/transaction/unregistered',
  })).data as FundingTransaction[];

  console.log("[REGISTER TX] unregistered transactions:", unregistered.length);

  // Register on chain
  for (const tx of unregistered) {
    try {
      const response = await axios({
        method: 'POST',
        url: appApiUrl + '/transaction/register',
        data: {
          txId: tx.txId,
        }
      });
      console.log("[REGISTER TX] registration response:", response.data);
    } catch (error) {
      console.log("[REGISTER TX] ERROR:", error);
    }
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[REGISTER TX] ERROR:", error);
  }
}
run();
