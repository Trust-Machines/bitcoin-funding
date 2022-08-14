import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingWallet } from '@prisma/client';

import { 
  getBalance,
} from '../../../common/bitcoin/electrum-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundingWallet | string | number>
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
  const result = await getBalance(address as string);
  res.status(200).json(parseFloat(result))
}
