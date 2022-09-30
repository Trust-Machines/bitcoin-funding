import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction, RegistrationStatus } from '@prisma/client';
import prisma from '@/common/db';
import { getTransactionData } from '@/common/bitcoin/electrum-api';
import { addUserFunding } from '@/common/stacks/fund-funding-v1-1';

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
    const result = await registerTransaction(req.body.txId)
    res.status(200).json(result)
  } catch (error) {
    if ((error as Error).message.includes("Invalid height")) {
      res.status(400).json("BTC transaction not mined yet");
    } else {
      console.log("[API] ERROR:", { directory: __dirname, error: error });
      res.status(400).json((error as Error).message);
    }
  }
}

export async function registerTransaction(txId: string) {
  let resultTransaction = await prisma.fundingTransaction.findUniqueOrThrow({
    where: {
      txId: txId,
    },
    include: {
      wallet: true,
    },
  });

  // Check if already registered
  if (resultTransaction.registrationStatus == RegistrationStatus.COMPLETED) {
    return resultTransaction;
  }

  // Check if registration already started
  if (resultTransaction.registrationStatus == RegistrationStatus.STARTED && resultTransaction.registrationTxId != null) {
    return resultTransaction;
  }

  // Register on chain
  const txData = await getTransactionData(txId, resultTransaction.wallet.address, resultTransaction.fundAddress);
  const registrationResult = await addUserFunding(
    txData.blockHeader,
    txData.blockHeight,
    txData.prevBlocks,
    txData.txHex,
    txData.proofTxIndex,
    txData.proofHashes,
    txData.proofTreeDepth,
    txData.senderIndex,
    txData.receiverIndex,
    resultTransaction.wallet.address,
    resultTransaction.fundAddress
  )
  const registrationTxId = registrationResult.txid;

  // Update DB if transaction was broadcasted
  if (registrationTxId != undefined && registrationResult.error == undefined) {
    const result = await prisma.fundingTransaction.update({
      where: {
        txId: txId,
      },
      data: {
        registrationStatus: RegistrationStatus.STARTED,
        registrationTxId: registrationTxId
      },
    });
    return result;
  }
  return resultTransaction;
}
