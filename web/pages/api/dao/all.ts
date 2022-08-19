import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao, RegistrationStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao[] | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Dao[]>
) {
  const prisma = new PrismaClient();
  const result = await prisma.dao.findMany();  
  res.status(200).json(result)
}
