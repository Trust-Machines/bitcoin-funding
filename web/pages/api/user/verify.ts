import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { getStxToBtc } from '@/common/stacks/user-registry-v1-1';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    // Get registration TX
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: req.body.appPrivateKey,
      }
    });

    // Check user registration in SC
    const userRegistered = await getStxToBtc(resultUser.address);

    // Update registration status
    let status = 'started';
    if (userRegistered != null) {
      status = 'completed';
    } else if (resultUser.registrationTxId != null) {
      // Get registration TX info
      const tx = await getTransactionInfo(resultUser.registrationTxId);
      if (tx.tx_status == 'aborted_by_response') {
        status = 'failed';
      }
    }

    if (userRegistered != null) {
      // Update status and funding wallet
      const registeredPublicKey = userRegistered.value.replace("0x", "");
      const result = await prisma.user.update({
        where: {
          appPrivateKey: req.body.appPrivateKey,
        },
        data: {
          registrationStatus: status,
          fundingWallet: { connect: { publicKey: registeredPublicKey } },
        },
      });
      res.status(200).json(result)
    } else {
      // Update status only
      const result = await prisma.user.update({
        where: {
          appPrivateKey: req.body.appPrivateKey,
        },
        data: {
          registrationStatus: status,
        },
      });
      res.status(200).json(result)
    }
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
