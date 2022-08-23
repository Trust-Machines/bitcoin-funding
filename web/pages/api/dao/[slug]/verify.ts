import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao, RegistrationStatus } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { isDaoRegistered } from '@/common/stacks/dao-registry-v1-1';
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

    // Check DAO registration in SC
    const daoRegistered = await isDaoRegistered(resultDao.address);

    let status: RegistrationStatus = RegistrationStatus.STARTED;
    if (daoRegistered) {
      status = RegistrationStatus.COMPLETED;
    } else if (resultDao.registrationTxId != null) {
      // Get registration TX info
      const tx = await getTransactionInfo(resultDao.registrationTxId);
      if (tx.tx_status == 'aborted_by_response') {
        status = RegistrationStatus.FAILED;
      }
    }

    // Update registration status
    const result = await prisma.dao.update({
      where: {
        address: resultDao.address,
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
