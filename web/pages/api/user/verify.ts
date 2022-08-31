import type { NextApiRequest, NextApiResponse } from 'next'
import { User, RegistrationStatus } from '@prisma/client';
import { getTransactionInfo, hashAppPrivateKey } from '@/common/stacks/utils';
import { getStxToBtc } from '@/common/stacks/user-registry-v1-1';
import { btcNetwork } from '@/common/constants';
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
    const hashedAppPrivateKey = await hashAppPrivateKey(req.body.appPrivateKey);

    // Get registration TX
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: hashedAppPrivateKey,
      }
    });

    // Check user registration in SC
    const userRegistered = await getStxToBtc(resultUser.address);

    // Update registration status
    let status = resultUser.registrationStatus;
    if (userRegistered != null) {
      status = RegistrationStatus.COMPLETED;
    } else if (resultUser.registrationTxId != null) {
      // Get registration TX info
      const tx = await getTransactionInfo(resultUser.registrationTxId);
      if (tx.tx_status == 'aborted_by_response') {
        status = RegistrationStatus.FAILED;
      }
    }

    if (userRegistered != null) {
      // Update status and funding wallet
      const registeredAddress = userRegistered.value;
      const address = bech32Encode(btcNetwork.bech32, registeredAddress.replace("0x0014", ""))

      const result = await prisma.user.update({
        where: {
          appPrivateKey: hashedAppPrivateKey,
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
          appPrivateKey: hashedAppPrivateKey,
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
