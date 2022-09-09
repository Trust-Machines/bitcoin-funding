import axios from 'axios';
import { API_URL } from '@/common/constants';
import { FundingTransaction } from '@prisma/client';

export async function start() {

  // Get unregistered
  const unregistered = (await axios({
    method: 'GET',
    url: API_URL + '/transaction/unregistered',
  })).data as FundingTransaction[];

  console.log("[REGISTER TX] unregistered transactions:", unregistered.length);

  // Register on chain
  for (const tx of unregistered) {
    try {
      const response = await axios({
        method: 'POST',
        url: API_URL + '/transaction/register',
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
