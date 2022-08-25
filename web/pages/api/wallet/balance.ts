import type { NextApiRequest, NextApiResponse } from 'next'
import { getBalance } from '@/common/bitcoin/electrum-api';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<number | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<number>
) {
  const { address } = req.query;
  const resultWallet = await prisma.fundingWallet.findUniqueOrThrow({
    where: {
      address: address as string,
    }
  });

  const result = await getBalance(resultWallet.address);
  res.status(200).json(result)
}
