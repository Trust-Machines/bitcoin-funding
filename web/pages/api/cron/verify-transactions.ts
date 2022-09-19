import { RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { verifyTransaction } from '../transaction/verify';

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
  
  // Get all unverified
  const unverified = await prisma.fundingTransaction.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  

  // Try to verify all
  for (const transaction of unverified) {
    try {
      let result = await verifyTransaction(transaction.txId);
      console.log("[VERIFY TX] verification response:", result);
    } catch (error) {
      console.log("[VERIFY TX] ERROR:", error);
    }
  }

  res.status(200).json("Unverified transactions: " + unverified.length);
}
