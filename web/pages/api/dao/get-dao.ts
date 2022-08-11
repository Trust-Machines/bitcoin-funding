import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  try {
    const { id } = req.query;
    const prisma = new PrismaClient();
    const daoResult = await prisma.dao.findUniqueOrThrow({
      where: {
        id: id as string,
      }
    });
    res.status(200).json(daoResult)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
