import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, FundingTransaction } from '@prisma/client';
import { getBalance, sendBtc } from '../../../common/bitcoin/electrum-api';

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

    const prisma = new PrismaClient();
    const resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: req.body.appPrivateKey,
      }
    });
    const resultWallet = await prisma.fundingWallet.findUniqueOrThrow({
      where: {
        publicKey: resultUser.fundingWalletPublicKey as string,
      }
    });

    // Check if enough balance
    const resultBalance = await getBalance(resultWallet.address);    
    if (req.body.sats == 0 || resultBalance < req.body.sats) {
      res.status(400).json("Insufficient balance: " + resultBalance + "/" + req.body.sats);
    } else {

      // Send
      const sendBtcResult = await sendBtc(
        resultWallet.privateKey,
        req.body.daoAddress,
        req.body.sats
      );

      // Save transaction info
      const resultTransaction = await prisma.fundingTransaction.create({
        data: {
          txId: sendBtcResult,
          wallet: { connect: { publicKey: resultWallet.publicKey } },
          status: 'started'
        },
      });

      res.status(200).json(resultTransaction)
    }
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
