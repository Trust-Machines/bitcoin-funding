import type { NextApiRequest, NextApiResponse } from 'next'
import { User, RegistrationStatus } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { getStxToBtc } from '@/common/stacks/user-registry-v1-1';
import { base58CheckEncode } from '@/common/bitcoin/encoding';
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
    let result = await verifyUser(req.body.address);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

export async function verifyUser(address: string) {
  let resultUser = await prisma.user.findUniqueOrThrow({
    where: {
      address: address,
    }
  });

  // Check if verification needs to be done
  if (resultUser.registrationStatus == RegistrationStatus.COMPLETED) {
    return resultUser;
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
    const fundingAddress = base58CheckEncode(registeredAddress.replace("0x0014", ""));

    const result = await prisma.user.update({
      where: {
        address: address,
      },
      data: {
        registrationStatus: status,
        fundingWallet: { connect: { address: fundingAddress } },
      },
    });
    return result;
  } else {
    // Update status only
    const result = await prisma.user.update({
      where: {
        address: address,
      },
      data: {
        registrationStatus: status,
      },
    });
    return result;
  }
}
