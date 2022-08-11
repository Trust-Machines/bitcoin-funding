import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao[]>
) {
  const prisma = new PrismaClient();
  const daoResults = await prisma.dao.findMany();  
  res.status(200).json(daoResults)
}
