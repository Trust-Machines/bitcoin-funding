import type { NextApiRequest, NextApiResponse } from 'next'
import { User, RegistrationStatus, PrismaClient } from '@prisma/client';
import { getTransactionInfo, hashAppPrivateKey } from '@/common/stacks/utils';
import { getStxToBtc } from '@/common/stacks/user-registry-v1-1';
import { BTC_NETWORK } from '@/common/constants';
import { bech32Encode } from '@/common/bitcoin/encoding';
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
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        address: req.body.address,
      }
    });

    // Check if verification needs to be done
    if (resultUser.registrationStatus == RegistrationStatus.COMPLETED) {
      res.status(200).json(resultUser)
      return;
    }

    // Check user registration in SC
    const userRegistered = await getStxToBtc(resultUser.address);

    // Update registration status
    let status: RegistrationStatus = resultUser.registrationStatus;
    if (userRegistered != null) {
      status = RegistrationStatus.COMPLETED;
    } else if (resultUser.registrationTxId != null) {
      // Get registration TX info
      const tx = await getTransactionInfo(resultUser.registrationTxId);
      if (tx.tx_status == 'aborted_by_response' || tx.error != undefined) {
        status = RegistrationStatus.FAILED;
      }
    }

    if (userRegistered != null) {
      // Update status and funding wallet
      const registeredAddress = userRegistered.value;
      const address = bech32Encode(BTC_NETWORK.bech32, registeredAddress.replace("0x0014", ""))

      const result = await prisma.user.update({
        where: {
          address: req.body.address,
        },
        data: {
          registrationStatus: status,
          fundingWallet: { connect: { address: address } },
        },
      });
      res.status(200).json(result)
    } else {
      // Update status only
      const result = await prisma.user.update({
        where: {
          address: req.body.address,
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
