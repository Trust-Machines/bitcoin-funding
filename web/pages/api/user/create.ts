
// TODO: remove as this is only for testing
// Need to update script "2-1-create-user.ts"

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const prisma = new PrismaClient();
    const result = await prisma.user.create({
      data: {
        appPrivateKey: req.body.appPrivateKey,
        address: req.body.address,
        registrationTxId: req.body.registrationTxId,
        registrationStatus: 'started'
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
