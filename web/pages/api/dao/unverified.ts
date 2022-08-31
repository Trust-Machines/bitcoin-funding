import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, Dao } from '@prisma/client';
import prisma from '@/common/db';

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
  const result = await prisma.dao.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  
  res.status(200).json(result)
}
