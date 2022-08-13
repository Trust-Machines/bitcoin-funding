import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, FundingWallet } from '@prisma/client';

import { 
  createWallet,
  createWalletXpub
} from '../../../common/bitcoin/bitcoin-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundingWallet | string>
) {
  if (req.method === 'PUt') {
    await putHandler(req, res);
  } else if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse<number>
) {
  // TODO: get transaction status
  // & save if needed
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundingWallet | string>
) {
  // TODO: forward funds
  // Create FundingTransaction
}
