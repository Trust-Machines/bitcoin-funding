import type { NextApiRequest, NextApiResponse } from 'next'
import { getBalance } from '@/common/bitcoin/electrum-api';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | number>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<number | string>
) {
  try {
    const { appPrivateKey } = req.query;

    const resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: appPrivateKey as string,
      }
    });

    const resultWallet = await prisma.fundingWallet.findUniqueOrThrow({
      where: {
        address: resultUser.fundingWalletAddress as string,
      }
    });

    const result = await getBalance(resultWallet.address);
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
