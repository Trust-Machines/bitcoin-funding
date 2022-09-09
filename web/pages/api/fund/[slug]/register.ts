import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund, RegistrationStatus } from '@prisma/client';
import { registerFund } from '@/common/stacks/fund-registry-v1-1';
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
    let resultFund = await prisma.fund.findUniqueOrThrow({
      where: {
        slug: slug as string,
      }
    });

    // Check if already registered
    if (resultFund.registrationStatus == RegistrationStatus.COMPLETED) {
      res.status(200).json(resultFund)
      return;
    }

    // Check if registration already started
    if (resultFund.registrationStatus == RegistrationStatus.STARTED && resultFund.registrationTxId != null) {
      res.status(200).json(resultFund)
      return;
    }

    // Register on chain
    const registrationResult = await registerFund(resultFund.address);
    const registrationTxId = registrationResult.txid;
    
    // Update DB if transaction was broadcasted
    if (registrationTxId != undefined) {
      const result = await prisma.fund.update({
        where: {
          address: resultFund.address,
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
