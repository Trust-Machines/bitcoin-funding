import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, FundingTransaction } from '@prisma/client';
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
  const result = await prisma.FundingTransaction.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  
  res.status(200).json(result)
}
