import { getTransactionHex } from '@/common/bitcoin/electrum-api';
import { getTransactionParsed } from '@/common/stacks/fund-funding-v1-1';
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
  try {
    const result = await verifyTransaction(req.body.txId);
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

export async function verifyTransaction(txId: string) {
  const result = await prisma.fundingTransaction.findUniqueOrThrow({
    where: {
      txId: txId,
    },
    include: {
      fund: true
    }
  });

  // Check if verification needs to be done
  if (result.registrationStatus == RegistrationStatus.COMPLETED) {
    return result;
  }

  const txHex = await getTransactionHex(txId);
  const parsed = await getTransactionParsed(txHex);

  // Update registration status
  let status: RegistrationStatus = result.registrationStatus;
  if (parsed) {
    status = RegistrationStatus.COMPLETED;
  } else if (result.registrationTxId != null) {
    // Get registration TX info
    const tx = await getTransactionInfo(result.registrationTxId);
    if (tx.tx_status == 'aborted_by_response' || tx.error != undefined) {
      status = RegistrationStatus.FAILED;
    }
  }

  // Check if member had already funded
  const memberCount = await prisma.fundingTransaction.aggregate({
    where: {
      walletAddress: result.walletAddress,
      registrationStatus: RegistrationStatus.COMPLETED
    },
    _count: true,
  });

  // Update status
  const updateTransaction = prisma.fundingTransaction.update({
    where: {
      txId: txId,
    },
    data: {
      registrationStatus: status
    },
  });
  
  if (status == RegistrationStatus.COMPLETED) {
    // Update totals
    const updateFund = prisma.fund.update({
      where: {
        address: result.fund.address
      },
      data: {
        totalSats: result.fund.totalSats + result.sats,
        totalMembers: memberCount._count > 0 ? result.fund.totalMembers : result.fund.totalMembers + 1
      }
    });

    const [resultUpdateTransaction, _] = await prisma.$transaction([updateTransaction, updateFund]);
    return resultUpdateTransaction;
  } else {
    const [resultUpdateTransaction] = await prisma.$transaction([updateTransaction]);
    return resultUpdateTransaction;
  }
}
