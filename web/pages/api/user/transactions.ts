import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction } from '@prisma/client';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundingTransaction[] | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundingTransaction[]>
) {
  const resultUser = await prisma.user.findUniqueOrThrow({
    where: {
      appPrivateKey: req.body.appPrivateKey,
    }
  });

  if (req.body.status == null) {
    // All funding transactions
    const resultTransactions = await prisma.fundingTransaction.findMany({
      where: {
        walletAddress: resultUser.fundingWalletAddress as string,
      }
    });  
    res.status(200).json(resultTransactions)
  } else {
    // Funding transactions filtered on status
    const resultTransactions = await prisma.fundingTransaction.findMany({
      where: {
        walletAddress: resultUser.fundingWalletAddress as string,
        registrationStatus: req.body.status
      }
    });  
    res.status(200).json(resultTransactions)
  }
}
