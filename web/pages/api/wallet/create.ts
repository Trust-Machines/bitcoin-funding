import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingWallet } from '@prisma/client';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundingWallet | string | number>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundingWallet | string>
) {
  try {
    const resultAll = await prisma.fundingWallet.findMany();  
    const walletResult = createWalletXpub(process.env.XPUB_MNEMONIC as string, resultAll.length);
    
    const resultCreate = await prisma.fundingWallet.create({
      data: {
        address: walletResult.address,
        index: resultAll.length
      },
    });
    res.status(200).json(resultCreate)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
