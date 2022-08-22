import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingWallet } from '@prisma/client';
import { createWallet, createWalletXpub } from '@/common/bitcoin/bitcoin-js';
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
    const walletResult = createWallet();

    // TODO: create forwarding wallet based on xpub wallet
    // const xpub = 'xpub6CzDCPbtLrrn4VpVbyyQLHbdSMpZoHN4iuW64VswCyEpfjM2mJGdaHJ2DyuZwtst96E16VvcERb8BBeJdHSCVmAq9RhtRQg6eAZFrTKCNqf';
    // const createWalletXpubResult = createWalletXpub(xpub, 0);
    const result = await prisma.fundingWallet.create({
      data: {
        publicKey: walletResult.publicKey,
        address: walletResult.address,
        privateKey: walletResult.privateKey as string
      },
    });
    result.privateKey = "";
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
