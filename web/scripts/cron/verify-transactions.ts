import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { FundingTransaction, User } from '@prisma/client';

export async function start() {

  // Get unverified
  const unverified = (await axios({
    method: 'GET',
    url: appApiUrl + '/transaction/unverified',
  })).data as FundingTransaction[];

  console.log("[VERIFY TXS] unverified users:", unverified.length);

  // Try to verify
  for (const transaction of unverified) {
    const response = await axios({
      method: 'POST',
      url: appApiUrl + '/transaction/verify',
      data: {
        txId: transaction.txId
      }
    });
    console.log("[VERIFY TXS] verification response:", response.data);
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