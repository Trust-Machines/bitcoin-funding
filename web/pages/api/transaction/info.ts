import type { NextApiRequest, NextApiResponse } from 'next'
import { getTransactionData } from '../../../common/bitcoin/electrum-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { txId, senderPublicKey, receiverPublicKey } = req.query;
  const txData = await getTransactionData(txId as string, senderPublicKey as string, receiverPublicKey as string);
  res.status(200).json(txData)
}
