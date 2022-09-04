import type { NextApiRequest, NextApiResponse } from 'next'
import { FundingTransaction, RegistrationStatus } from '@prisma/client';
import prisma from '@/common/db';
import { getTransactionData } from '@/common/bitcoin/electrum-api';
import { addUserFunding } from '@/common/stacks/dao-funding-v1-1';

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
    let resultTransaction = await prisma.fundingTransaction.findUniqueOrThrow({
      where: {
        txId: req.body.txId,
      },
      include: {
        wallet: true,
      },
    });

    // Check if already registered
    if (resultTransaction.registrationStatus == RegistrationStatus.COMPLETED) {
      res.status(200).json(resultTransaction)
      return;
    }

    // Check if registration already started
    if (resultTransaction.registrationStatus == RegistrationStatus.STARTED && resultTransaction.registrationTxId != null) {
      res.status(200).json(resultTransaction)
      return;
    }

    // Register on chain
    const txData = await getTransactionData(req.body.txId, resultTransaction.wallet.address, resultTransaction.daoAddress);
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
      resultTransaction.daoAddress
    )
    const registrationTxId = registrationResult.txid;

    // Update DB if transaction was broadcasted
    if (registrationTxId != undefined) {
      const result = await prisma.fundingTransaction.update({
        where: {
          txId: req.body.txId,
        },
        data: {
          registrationTxId: registrationTxId
        },
      });
      res.status(200).json(result)
    } else {
      res.status(400).json(registrationResult);
    }
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
