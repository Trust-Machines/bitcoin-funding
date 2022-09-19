import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund, RegistrationStatus } from '@prisma/client';
import { registerFund as registerFundOnChain } from '@/common/stacks/fund-registry-v1-1';
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
    const result = await registerFund(slug as string);
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

export async function registerFund(slug: string) {
  let resultFund = await prisma.fund.findUniqueOrThrow({
    where: {
      slug: slug,
    }
  });

  // Check if already registered
  if (resultFund.registrationStatus == RegistrationStatus.COMPLETED) {
    return resultFund;
  }

  // Check if registration already started
  if (resultFund.registrationStatus == RegistrationStatus.STARTED && resultFund.registrationTxId != null) {
    return resultFund;
  }

  // Register on chain
  const registrationResult = await registerFundOnChain(resultFund.address);
  const registrationTxId = registrationResult.txid;
  
  // Update DB if transaction was broadcasted
  if (registrationTxId != undefined) {
    const result = await prisma.fund.update({
      where: {
        address: resultFund.address,
      },
      data: {
        registrationStatus: RegistrationStatus.STARTED,
        registrationTxId: registrationTxId
      },
    });
    return result;
  }
  return resultFund;
}
