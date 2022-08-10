// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { send } from 'process';

import { 
  getCurrentBlockHeight,
  getBlockInfo,
  getTransactionInfo
} from '../../common/bitcoin/bitcoin-core-api';

import { 
  createWallet,
  createWalletXpub
} from '../../common/bitcoin/bitcoin-js';

import { 
  getBalance,
  sendBtc
} from '../../common/bitcoin/electrum-api';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  // const createWalletResult = createWallet();
  // console.log("createWalletResult: ", createWalletResult);

  // const xpub = 'xpub6CzDCPbtLrrn4VpVbyyQLHbdSMpZoHN4iuW64VswCyEpfjM2mJGdaHJ2DyuZwtst96E16VvcERb8BBeJdHSCVmAq9RhtRQg6eAZFrTKCNqf';
  // const createWalletXpubResult = createWalletXpub(xpub, 0);
  // console.log("createWalletXpubResult: ", createWalletXpubResult);

  // const balanceResult = await getBalance("n2qEP66HWYsNf75krwQ7PZ4S4agy8SuzNi");
  // console.log("balanceResult: ", balanceResult);

  // const sendBtcResult = await sendBtc(
  //   "28e105d8e3c8cf5d81137779b4c8c946291393fb001daeb8e6dc7393b9fa94b6",
  //   "n2v875jbJ4RjBnTjgbfikDfnwsDV5iUByw",
  //   12345
  // );
  // console.log("sendBtcResult: ", sendBtcResult);

  res.status(200).json({ name: 'John Doe' })
}
