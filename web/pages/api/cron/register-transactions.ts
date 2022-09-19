import { RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { registerTransaction } from '../transaction/register';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {

  // Get unregistered
  const unregistered = await prisma.fundingTransaction.findMany({
    where: { 
      OR: [
        {
          registrationStatus: RegistrationStatus.STARTED,
          registrationTxId: null
        },
        {
          registrationStatus: RegistrationStatus.FAILED,
        }
      ]
    }
  }); 
  
  // Try to register all
  for (const transaction of unregistered) {
    try {
      let result = await registerTransaction(transaction.txId);
      console.log("[REGISTER TX] registration response:", result);
    } catch (error) {
      console.log("[REGISTER TX] ERROR:", error);
    }
  }

  res.status(200).json("Unregistered transactions: " + unregistered.length);
}
