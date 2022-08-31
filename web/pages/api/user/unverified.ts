import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, User } from '@prisma/client';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[] | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  const result = await prisma.user.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  
  res.status(200).json(result)
}
