import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction } from '@prisma/client';
import { getBalance, sendBtc } from '@/common/bitcoin/electrum-api';
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';

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
  try {
    const body = JSON.parse(req.body);
    const hashedAppPrivateKey = await hashAppPrivateKey(body.appPrivateKey);
    const resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: hashedAppPrivateKey,
      }
    });
    const resultWallet = await prisma.fundingWallet.findUniqueOrThrow({
      where: {
        address: resultUser.fundingWalletAddress as string,
      }
    });

    // Check if enough balance
    const resultBalance = await getBalance(resultWallet.address);    
    if (body.sats == 0 || resultBalance < body.sats) {
      res.status(400).json("Insufficient balance: " + resultBalance + "/" + body.sats);
    } else {
      // Send BTC
      const wallet = createWalletXpub(process.env.XPUB_MNEMONIC as string, resultWallet.index)
      const sendBtcResult = await sendBtc(
        wallet.privateKey,
        body.fundAddress,
        body.sats,
      );

      const resultTransaction = await prisma.fundingTransaction.create({
        data: {
          txId: sendBtcResult,
          wallet: { connect: { address: resultWallet.address } },
          fund: { connect: { address: body.fundAddress } },
          sats: body.sats,
        },
      });
      res.status(200).json(resultTransaction)
    }
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
