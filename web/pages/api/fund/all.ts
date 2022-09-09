import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db';

export type FundsPaged = {
  funds: Fund[]
  total: number
  totalPages: number
  currentPage: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundsPaged | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundsPaged>
) {
  const { page } = req.query;
  const pageSize = 15;

  const result = await prisma.fund.findMany({
    skip: parseInt(page as string) * pageSize,
    take: pageSize,
  });

  const fundCount = await prisma.fund.aggregate({
    _count: true,
  });

  res.status(200).json({
    Funds: result,
    total: fundCount._count,
    totalPages: Math.ceil(fundCount._count / pageSize),
    currentPage: parseInt(page as string)
  })
}
