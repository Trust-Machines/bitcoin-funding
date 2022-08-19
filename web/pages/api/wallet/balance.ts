import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, FundingWallet } from '@prisma/client';
import { getBalance } from '@/common/bitcoin/electrum-api';

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
  const prisma = new PrismaClient();
  const resultWallet = await prisma.fundingWallet.findUniqueOrThrow({
    where: {
      address: address as string,
    }
  });

  const result = await getBalance(resultWallet.address);
  res.status(200).json(result)
}
