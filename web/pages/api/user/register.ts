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
    const body = JSON.parse(req.body);
    const hashedAppPrivateKey = await hashAppPrivateKey(body.appPrivateKey);

    // Get registration TX
    const resultUser = await prisma.user.findUniqueOrThrow({
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
    // TODO: check if user already has a wallet just to be sure
    // in case there are front-end bugs, we need to make sure the API just returns the user's BTC xpub wallet
    // and doesn't create a new one
    const resultAllWallets = await prisma.fundingWallet.findMany(); // TODO: is this performant? shouldn't we just get the count?
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
