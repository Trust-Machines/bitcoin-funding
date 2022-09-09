import axios from 'axios';
import { API_URL } from '@/common/constants';
import { FundingTransaction, User } from '@prisma/client';

export async function start() {

  // Get unverified
  const unverified = (await axios({
    method: 'GET',
    url: API_URL + '/transaction/unverified',
  })).data as FundingTransaction[];

  console.log("[VERIFY TXS] unverified transactions:", unverified.length);

  // Try to verify
  for (const transaction of unverified) {
    try {
      const response = await axios({
        method: 'POST',
        url: API_URL + '/transaction/verify',
        data: {
          txId: transaction.txId
        }
      });
      console.log("[VERIFY TXS] verification response:", response.data);
    } catch (error) {
      console.log("[VERIFY TXS] ERROR:", error);
    }
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[VERIFY TXS] ERROR:", error);
  }
}
run();
