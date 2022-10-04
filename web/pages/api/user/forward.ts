import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import { ForwardConfirmation } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForwardConfirmation | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<ForwardConfirmation | string>
) {
  try {
    const body = JSON.parse(req.body);
    const hashedAppPrivateKey = await hashAppPrivateKey(body.appPrivateKey);
    const user = await prisma.user.findUniqueOrThrow({
      where: { appPrivateKey: hashedAppPrivateKey },
      include: { forwardConfirmation: true }
    });

    const confirmation = await prisma.forwardConfirmation.update({
      where: { address: user.address },
      data: {
        fundAddress: body.fundAddress,
        fundTransactionId: null
      }
    })
    res.status(200).json(confirmation)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
