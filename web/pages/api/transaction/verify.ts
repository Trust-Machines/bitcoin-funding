import { getTransactionHex } from '@/common/bitcoin/electrum-api';
import { getTransactionParsed } from '@/common/stacks/dao-funding-v1-1';
import { FundingTransaction, RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { getTransactionInfo } from '@/common/stacks/utils';

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
  const result = await prisma.fundingTransaction.findUniqueOrThrow({
    where: {
      txId: req.body.txId,
    }
  });

  // Check if verification needs to be done
  if (result.registrationStatus != RegistrationStatus.STARTED) {
    res.status(200).json(result)
    return;
  }

  const txHex = await getTransactionHex(req.body.txId);
  const parsed = await getTransactionParsed(txHex);

  // Update registration status
  let status = result.registrationStatus;
  if (parsed) {
    status = RegistrationStatus.COMPLETED;
  } else if (result.registrationTxId != null) {
    // Get registration TX info
    const tx = await getTransactionInfo(result.registrationTxId);
    if (tx.tx_status == 'aborted_by_response') {
      status = RegistrationStatus.FAILED;
    }
  }

  const resultUpdate = await prisma.fundingTransaction.update({
    where: {
      txId: req.body.txId,
    },
    data: {
      registrationStatus: status,
    },
  });
  res.status(200).json(resultUpdate)
}
