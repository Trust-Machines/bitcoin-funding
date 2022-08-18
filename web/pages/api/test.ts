// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { send } from 'process';

import { 
  getCurrentBlockHeight,
  getBlockInfo,
  getTransactionInfo
} from '@/common/bitcoin/bitcoin-core-api';

import { 
  createWallet,
  createWalletXpub
} from '@/common/bitcoin/bitcoin-js';

import { 
  getBalance,
  sendBtc
} from '@/common/bitcoin/electrum-api';

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

  // const balanceResult = await getBalance("bcrt1qnqkywjp7dd0eq32rgeswsl6555vnzjdr77yz7z");
  // console.log("balanceResult: ", balanceResult);

  // const sendBtcResult = await sendBtc(
  //   "77c23dc5ab2958adce5d85a8bd4d2e1e7e0eb8a905c011d0cbd635c32eec5e1a",
  //   "n2v875jbJ4RjBnTjgbfikDfnwsDV5iUByw",
  //   12345
  // );
  // console.log("sendBtcResult: ", sendBtcResult);

  // const txHex = "02000000014b16ab3a45cc1028f262031673dca674d088984c4b06232a76034448ec44e1b10000000000ffffffff0253f1420000000000160014982c47483e6b5f9045434660e87f54a5193149a339300000000000001976a914eabc65f3e890fb8bf20d153e95119c72d85765a988ac00000000";
  // const parseResult = await parseTx(txHex);
  // console.log("parseResult: ", parseResult);

  res.status(200).json({ name: 'John Doe' })
}
