import { getTransactionHex } from '@/common/bitcoin/electrum-api';
import { getTransactionParsed } from '@/common/stacks/dao-funding-v1-1';
import { FundingTransaction, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundingTransaction | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundingTransaction | string>
) {

  const prisma = new PrismaClient();
  const result = await prisma.fundingTransaction.findUniqueOrThrow({
    where: {
      txId: req.body.txId,
    }
  });

  const txHex = await getTransactionHex(req.body.txId);
  const parsed = await getTransactionParsed(txHex);

  if (parsed) {
    const result = await prisma.fundingTransaction.update({
      where: {
        txId: req.body.txId,
      },
      data: {
        status: 'completed',
      },
    });
    res.status(200).json(result)
  } else {
    res.status(200).json(result)
  }
}
