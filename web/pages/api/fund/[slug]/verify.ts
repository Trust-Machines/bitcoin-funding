import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund, RegistrationStatus } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { isFundRegistered } from '@/common/stacks/fund-registry-v1-1';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  try {
    const { slug } = req.query;
    const result = await verifyFund(slug as string);
    res.status(200).json(result)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}

export async function verifyFund(slug: string) {
  let resultFund = await prisma.fund.findUniqueOrThrow({
    where: {
      slug: slug,
    }
  });

  // Check if verification needs to be done
  if (resultFund.registrationStatus == RegistrationStatus.COMPLETED) {
    return resultFund;
  }

  // Check Fund registration in SC
  const fundRegistered = await isFundRegistered(resultFund.address);

  let status: RegistrationStatus = resultFund.registrationStatus;
  if (fundRegistered) {
    status = RegistrationStatus.COMPLETED;
  } else if (resultFund.registrationTxId != null) {
    // Get registration TX info
    const tx = await getTransactionInfo(resultFund.registrationTxId);
    if (tx.tx_status == 'abort_by_response' || tx.error != undefined) {
      status = RegistrationStatus.FAILED;
    }
  }

  // Update registration status
  const result = await prisma.fund.update({
    where: {
      address: resultFund.address,
    },
    data: {
      registrationStatus: status
    },
  });
  return result;
}
