// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { send } from 'process';

import { 
  getCurrentBlockHeight,
  getBlockInfo,
  getTransactionInfo
} from '../../common/bitcoin-core-api';

import { 
  createWallet,
} from '../../common/bitcoin-js';

import { 
  getBalance,
  listUnspent,
  sendBtc
} from '../../common/electrum-api';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  // const wallet = createWallet();
  // console.log("wallet: ", wallet);

  // wallet:  {
  //   address: 'n2qEP66HWYsNf75krwQ7PZ4S4agy8SuzNi',
  //   privateKey: '28e105d8e3c8cf5d81137779b4c8c946291393fb001daeb8e6dc7393b9fa94b6'
  // }

  const balance = await getBalance("n2qEP66HWYsNf75krwQ7PZ4S4agy8SuzNi");
  console.log("balance: ", balance);

  const balance2 = await getBalance("n2v875jbJ4RjBnTjgbfikDfnwsDV5iUByw");
  console.log("balance2: ", balance2);

  // const listUnspentResult = await listUnspent("n2qEP66HWYsNf75krwQ7PZ4S4agy8SuzNi");
  // console.log("listUnspent: ", listUnspentResult);



  // const sendResult = await sendBtc();
  // console.log("sendResult: ", sendResult);




  // const height = await getCurrentBlockHeight();
  // console.log("height: ", height);

  // const blockInfo = await getBlockInfo(height);
  // console.log("blockInfo: ", blockInfo);

  // const tx = blockInfo.tx[0];
  // const txInfo = await getTransactionInfo(tx);
  // console.log("txInfo: ", txInfo);

  res.status(200).json({ name: 'John Doe' })
}
