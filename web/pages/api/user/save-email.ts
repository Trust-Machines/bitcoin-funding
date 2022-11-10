import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, User } from '@prisma/client';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import prisma from '@/common/db';
import { registerUser } from '@/common/stacks/user-registry-v1-1';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';

const startIndex = process.env.XPUB_START_INDEX ? parseInt(process.env.XPUB_START_INDEX) : 0;

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
    const body = JSON.parse(req.body);
    const hashedAppPrivateKey = await hashAppPrivateKey(body.appPrivateKey);

    const result = await prisma.user.update({
      where: {
        appPrivateKey: hashedAppPrivateKey
      },
      data: {
        email: body.email == "" ? null : body.email
      },
    });
    res.status(200).json(result)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
