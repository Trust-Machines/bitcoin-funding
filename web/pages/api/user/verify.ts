import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client';
import { getTransactionInfo } from '@/common/stacks/utils';
import { getStxToBtc } from '@/common/stacks/user-registry-v1-1';
import { btcNetwork } from '@/common/constants';
let { bech32 } = require('bech32')

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
    const prisma = new PrismaClient();

    // Get registration TX
    let resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: req.body.appPrivateKey,
      }
    });

    // Check user registration in SC
    const userRegistered = await getStxToBtc(resultUser.address);
    console.log("userRegistered:", userRegistered);

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
      const registeredAddress = userRegistered.value;
      console.log("registeredAddress", registeredAddress);



      // let b32res = bech32.decode(address)
      // let witnessData = bech32.fromWords(registeredAddress.slice(1))
      // let witnessOpcodes = [0, 0x14]
      // let script = Buffer.from(witnessOpcodes.concat(witnessData))
      // console.log("script: ", script);


      const buffer = Buffer.from("1403051d101e021b1a0003170312140a18040919171d0911190c001e1b040c15", 'hex')

      let strByte = bech32.toWords(buffer);
      let t = bech32.encode(btcNetwork.bech32, "1403051d101e021b1a0003170312140a18040919171d0911190c001e1b040c15");
      console.log("encoded t: ", t);

      let words = bech32.toWords(Buffer.from('bcrt', 'utf8'))
      const encoded = bech32.encode(words, registeredAddress);
      console.log("encoded: ", encoded);

      const result = await prisma.user.update({
        where: {
          appPrivateKey: req.body.appPrivateKey,
        },
        data: {
          registrationStatus: status,
          fundingWallet: { connect: { address: registeredAddress } },
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
