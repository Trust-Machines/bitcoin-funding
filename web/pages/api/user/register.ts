import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, User } from '@prisma/client';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import prisma from '@/common/db';
import { registerUser } from '@/common/stacks/user-registry-v1-1';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';

const startIndex = process.env.XPUB_START_INDEX ? parseInt(process.env.XPUB_START_INDEX) : 0;

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
    const body = JSON.parse(req.body);
    const result = await registerUserHelper(body.appPrivateKey);
    res.status(result.status).json(result.result);
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}

export async function registerUserHelper(appPrivateKey: string) {
  const hashedAppPrivateKey = await hashAppPrivateKey(appPrivateKey);

  // Get registration TX
  const resultUser = await prisma.user.findUniqueOrThrow({
    where: {
      appPrivateKey: hashedAppPrivateKey,
    }
  });

  // Check if already registered
  if (resultUser.registrationStatus == RegistrationStatus.COMPLETED) {
    return {status: 200, result: resultUser};
  }

  // Check if registration already started
  if (resultUser.registrationStatus == RegistrationStatus.STARTED && resultUser.registrationTxId != null) {
    return {status: 200, result: resultUser};
  }

  // Create new funding wallet for user
  const walletCount = await prisma.fundingWallet.aggregate({ _count: true });
  const walletIndex = startIndex + walletCount._count;
  const newWallet = createWalletXpub(process.env.XPUB_MNEMONIC as string, walletIndex);
  const resultWallet = await prisma.fundingWallet.create({
    data: {
      address: newWallet.address,
      index: walletIndex
    },
  });

  // Register on chain
  const registrationResult = await registerUser(resultUser.address, resultWallet.address);
  const registrationTxId = registrationResult.txid;
  
  // Update DB if transaction was broadcasted
  if (registrationTxId != undefined && registrationResult.error == undefined) {
    const result = await prisma.user.update({
      where: {
        appPrivateKey: hashedAppPrivateKey
      },
      data: {
        registrationStatus: RegistrationStatus.STARTED,
        registrationTxId: registrationTxId,
      },
    });
    return {status: 200, result: result};
  } else {
    return {status: 400, result: registrationResult};
  }
}
