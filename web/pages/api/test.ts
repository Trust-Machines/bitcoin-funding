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
  createWalletXpub,
} from '@/common/bitcoin/bitcoin-js';

import { 
  base58CheckDecode,
  bech32Encode,
  bech32Decode
} from '@/common/bitcoin/encoding';

import { 
  getBalance,
  getEstimatedFee,
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

  // const createWalletResult = await createXpubWallet();
  // console.log("createWalletResult: ", createWalletResult);

  // const createWalletXpubResult = createWalletXpub(process.env.XPUB_MNEMONIC as string, 0);
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

  // const resultDecode = base58CheckDecode("1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs");
  // console.log("resultDecode:", resultDecode);  

  // const resultDecode = bech32Decode("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4");
  // console.log("resultDecode:", resultDecode);  

  // const resultEncode = bech32Encode("bc", "751e76e8199196d454941c45d1b3a323f1433bd6");
  // console.log("resultEncode:", resultEncode);  

  // const resultEstimatedFee = await getEstimatedFee();
  // console.log("resultEstimatedFee:", resultEstimatedFee);

  res.status(200).json({ name: 'John Doe' })
}
