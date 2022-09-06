import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import prisma from '@/common/db';

export type DaosPaged = {
  daos: Dao[]
  total: number
  totalPages: number
  currentPage: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DaosPaged | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<DaosPaged>
) {
  const { page } = req.query;
  const pageSize = 15;

  const result = await prisma.dao.findMany({
    skip: parseInt(page as string) * pageSize,
    take: pageSize,
  });

  const daoCount = await prisma.dao.aggregate({
    _count: true,
  });

  res.status(200).json({
    daos: result,
    total: daoCount._count,
    totalPages: Math.ceil(daoCount._count / pageSize),
    currentPage: parseInt(page as string)
  })
}
