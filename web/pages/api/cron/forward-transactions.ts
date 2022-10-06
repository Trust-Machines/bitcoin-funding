import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { getBalance, sendBtc } from '@/common/bitcoin/electrum-api';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {

  const confirmations = await prisma.forwardConfirmation.findMany({
    where: { 
      NOT: { fundAddress: null },
      fundTransaction: undefined 
    },
    include: { user: true }
  })

  var pendingCount = 0;
  for (const confirmation of confirmations) {
    const fundingWallet = await prisma.fundingWallet.findUniqueOrThrow({
      where: { address: confirmation.user.fundingWalletAddress as string }
    });

    const balance = await getBalance(fundingWallet.address);
    if (balance > 1000) {
      pendingCount += 1;

      // Forward BTC
      const wallet = createWalletXpub(process.env.XPUB_MNEMONIC as string, fundingWallet.index)
      const sendBtcResult = await sendBtc(
        wallet.privateKey,
        confirmation.fundAddress,
        balance,
      );

      // Create funding transaction
      await prisma.fundingTransaction.create({
        data: {
          txId: sendBtcResult,
          userAddress: confirmation.address,
          wallet: { connect: { address: fundingWallet.address } },
          fund: { connect: { address: confirmation.fundAddress } },
          sats: balance,
        },
      });

      // Update confirmation
      await prisma.forwardConfirmation.update({
        where: { address: confirmation.address },
        data: { fundTransaction: { connect: { txId: sendBtcResult }} }
      })
    }
  }

  res.status(200).json("Confirmations pending: " + pendingCount);
}
