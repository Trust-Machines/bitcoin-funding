import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client';
import { getTransactionInfo } from '../../../common/stacks/utils';
import { getStxToBtc } from '../../../common/stacks/user-registry-v1-1';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else if (req.method === 'GET') {
    await getHandler(req, res);
  } else if (req.method === 'PUT') {
    await putHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const { appPrivateKey } = req.query;
    const prisma = new PrismaClient();
    const result = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: appPrivateKey as string,
      }
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const prisma = new PrismaClient();
    const result = await prisma.user.create({
      data: {
        appPrivateKey: req.body.appPrivateKey,
        address: req.body.address,
        registrationTxId: req.body.registrationTxId,
        registrationStatus: 'started'
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const prisma = new PrismaClient();

    // Get registration TX
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: req.body.appPrivateKey,
      }
    });

    // Check user registration in SC
    const userRegistered = await getStxToBtc(resultUser.address);
    const registeredPublicKey = userRegistered.value.replace("0x", "");

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

    // Update registration status
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
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}