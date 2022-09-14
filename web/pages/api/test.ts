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

import { 
  verifyBlockHeader,
  wasTxMinedPrev 
} from '@/common/stacks/clarity-bitcoin';

type Data = {
  output: string
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

  // const headerHex = "0x004065301602a9e2b6ece848bc85e39c89b58220d4bb45d9375eb1e32b000000000000002ebb3a73684eb7c0c2acf78e6f3465b0f7ad77e067132483f907927d2f7080ce4b2f2063bc292d196091b006";  
  // const verifyBlockHeaderResult = await verifyBlockHeader(headerHex, 74718);
  // console.log("verifyBlockHeaderResult: ", verifyBlockHeaderResult);


  // const headerHex = "0x004065301602a9e2b6ece848bc85e39c89b58220d4bb45d9375eb1e32b000000000000002ebb3a73684eb7c0c2acf78e6f3465b0f7ad77e067132483f907927d2f7080ce4b2f2063bc292d196091b006";
  // const prevHeaderHex = [
  //   "0x0000202081478285430323543a050ce2a4f45a3f820df9e79725653652822465000000007315dfa02ba65ee1b61506fed641f82620a66e0209bf9633c511e60122c8faaf402e2063bc292d19162ec468",
  //   "0x000000205f17323fd48a1b2e6060cb458e8ed94bc6ecb7acba4203e000000000000000004611b78b7d11754863347121366a1a6b2a1027aee4dc3eb9fd6ea436f2d8f56e9a2c2063ffff001d6a7a3ec8"
  // ];
  // const txHex = "0x0200000001c59a01d2086e4cf0623e5eaf0362634183ae47794ed55d96c28562b05163e53a000000006b483045022100fd328b98ec9331922cb1c5a5fa954ce6824b0a2ed7dea5324ea847125c86d8910220185c63b64b7e9fae620e2e08d528b8969044d1ac3bd5b68908f861087d4115050121024ce61177ee9c2164f37b7f457716a8ce2ccd50861fc5b5bc16185d6c770fb9d7ffffffff02f4010000000000001976a9140da88f35f4b5862d6580380dd5a856a439d1249088ac6307030000000000160014267c3c2cfeefd747fc3ea58817d62b2dd42f33cd00000000";
  // const blockHeight = 74718;
  // const proofTxIndex = 25;
  // const proofTreeDepth = 7;
  // const proofHashes = [
  //   "0xee2615769bb4507372b3f7124b80e0d23628710923845434fa6590c30312063d",
  //   "0x6ba309a5895e7c9115a114b182df57c75b6a5827fe50666d8b9120b289e874f0",
  //   "0xe875f18b280a88580ca9cadab38b93d59cd06b15e0e70f218a2ec73d0f07cc61",
  //   "0xa4ea1b0ef883d5a703545148a80e2bd9437cee671c7bd3b994958bad69ca9c6e",
  //   "0xc46ab64426aaf4d8d20f1d26a1da7830dac8e8de831773e5a63bdc04a4469393",
  //   "0x739cd480b5a513d2b8e7ee25d2c38afe4020efe944fa70c4975d63a945d26c0b",
  //   "0xb059d14fdde2fad53ba6b7482f0fc5269e277fce6cc6558aeddc52c38e9b8281",
  // ]
  // const wasTxMinedPrevResult = await wasTxMinedPrev(headerHex, blockHeight, prevHeaderHex, txHex, proofTxIndex, proofHashes, proofTreeDepth);
  // console.log("wasTxMinedPrevResult: ", wasTxMinedPrevResult);

  res.status(200).json({ output: 'Check console ;)' })
}
