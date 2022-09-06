import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction, RegistrationStatus } from '@prisma/client';
import prisma from '@/common/db';

export type TransactionsPaged = {
  transactions: FundingTransaction[]
  total: number
  totalPages: number
  currentPage: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionsPaged | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionsPaged>
) {
  const { slug, page } = req.query;
  const pageSize = 15;

  const resultDao = await prisma.dao.findUniqueOrThrow({
    where: {
      slug: slug as string,
    }
  });

  const resultTransactions = await prisma.FundingTransaction.findMany({
    skip: parseInt(page as string) * pageSize,
    take: pageSize,
    where: {
      daoAddress: resultDao.address,
      registrationStatus: RegistrationStatus.COMPLETED
    },
    include: {
      wallet: { select: { user: { select: {
        address: true
      } } } },
    },
  });  

  const transactionCount = await prisma.FundingTransaction.aggregate({
    _count: true,
  });
  
  res.status(200).json({
    transactions: resultTransactions,
    total: transactionCount._count,
    totalPages: Math.ceil(transactionCount._count / pageSize),
    currentPage: parseInt(page as string)
  })
}
