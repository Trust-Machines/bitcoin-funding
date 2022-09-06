import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, User } from '@prisma/client';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import prisma from '@/common/db';
import { registerUser } from '@/common/stacks/user-registry-v1-1';
import { createWalletXpub } from '@/common/bitcoin/bitcoin-js';

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
    const hashedAppPrivateKey = await hashAppPrivateKey(req.body.appPrivateKey);

    // Get registration TX
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: hashedAppPrivateKey,
      }
    });

    // Check if already registered
    if (resultUser.registrationStatus == RegistrationStatus.COMPLETED) {
      res.status(200).json(resultUser)
      return;
    }

    // Check if registration already started
    if (resultUser.registrationStatus == RegistrationStatus.STARTED && resultUser.registrationTxId != null) {
      res.status(200).json(resultUser)
      return;
    }

    // Create new funding wallet for user
    const resultAllWallets = await prisma.fundingWallet.findMany();  
    const newWallet = createWalletXpub(process.env.XPUB_MNEMONIC as string, resultAllWallets.length);
    const resultWallet = await prisma.fundingWallet.create({
      data: {
        address: newWallet.address,
        index: resultAllWallets.length
      },
    });

    // Register on chain
    const registrationResult = await registerUser(resultUser.address, resultWallet.address);
    const registrationTxId = registrationResult.txid;
    
    // Update DB if transaction was broadcasted
    if (registrationTxId != undefined) {
      const result = await prisma.user.update({
        where: {
          appPrivateKey: hashedAppPrivateKey,
        },
        data: {
          registrationTxId: registrationTxId,
          fundingWalletAddress: newWallet.address
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
