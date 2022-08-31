import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction, RegistrationStatus } from '@prisma/client';
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
  const { slug } = req.query;
  const resultDao = await prisma.dao.findUniqueOrThrow({
    where: {
      slug: slug as string,
    }
  });
  const resultTransactions = await prisma.FundingTransaction.findMany({
    where: {
      daoAddress: resultDao.address,
      registrationStatus: RegistrationStatus.COMPLETED
    }
  });  
  res.status(200).json(resultTransactions)
}
