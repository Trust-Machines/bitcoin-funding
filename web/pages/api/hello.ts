// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { 
  getCurrentBlockHeight,
  getBlockInfo,
  getTransactionInfo
} from '../../common/bitcoin-node';

import { 
  createWallet,
} from '../../common/bitcoin-lib';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const wallet = createWallet();
  console.log("wallet: ", wallet);

  // const height = await getCurrentBlockHeight();
  // console.log("height: ", height);

  // const blockInfo = await getBlockInfo(height);
  // console.log("blockInfo: ", blockInfo);

  // const tx = blockInfo.tx[0];
  // const txInfo = await getTransactionInfo(tx);
  // console.log("txInfo: ", txInfo);

  res.status(200).json({ name: 'John Doe' })
}
