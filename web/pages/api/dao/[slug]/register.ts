import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao, RegistrationStatus } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { isDaoRegistered, registerDao } from '@/common/stacks/dao-registry-v1-1';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  try {
    // Get registration TX
    const { slug } = req.query;
    let resultDao = await prisma.dao.findUniqueOrThrow({
      where: {
        slug: slug as string,
      }
    });

    // Check if already registered
    if (resultDao.registrationStatus == RegistrationStatus.COMPLETED) {
      res.status(200).json(resultDao)
      return;
    }

    // Check if registration already started
    if (resultDao.registrationStatus == RegistrationStatus.STARTED && resultDao.registrationTxId != null) {
      res.status(200).json(resultDao)
      return;
    }

    // Register on chain
    const registrationResult = await registerDao(resultDao.address);
    const registrationTxId = registrationResult.txid;
    
    // Update DB if transaction was broadcasted
    if (registrationTxId != undefined) {
      const result = await prisma.dao.update({
        where: {
          address: resultDao.address,
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
