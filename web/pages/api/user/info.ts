import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@prisma/client';
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const { appPrivateKey } = req.query;
    const hashedAppPrivateKey = await hashAppPrivateKey(appPrivateKey as string);
    const result = await prisma.user.findUniqueOrThrow({
      where: { appPrivateKey: hashedAppPrivateKey },
      include: { forwardConfirmation: true }
    });
    res.status(200).json(result)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
