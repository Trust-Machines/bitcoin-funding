import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { isDaoRegistered } from '@/common/stacks/dao-registry-v1-1';

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
    const prisma = new PrismaClient();

    // Get registration TX
    let resultDao = await prisma.dao.findUniqueOrThrow({
      where: {
        publicKey: req.body.publicKey,
      }
    });

    // Check DAO registration in SC
    const daoRegistered = await isDaoRegistered(req.body.publicKey);

    let status = 'started';
    if (daoRegistered) {
      status = 'completed';
    } else if (resultDao.registrationTxId != null) {
      // Get registration TX info
      const tx = await getTransactionInfo(resultDao.registrationTxId);
      if (tx.tx_status == 'aborted_by_response') {
        status = 'failed';
      }
    }

    // Update registration status
    const result = await prisma.dao.update({
      where: {
        publicKey: req.body.publicKey,
      },
      data: {
        registrationStatus: status
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
