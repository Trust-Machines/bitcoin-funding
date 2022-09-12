import type { NextApiRequest, NextApiResponse } from 'next'
import { RegistrationStatus, Fund } from '@prisma/client';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund[] | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Fund[]>
) {
  const result = await prisma.fund.findMany({
    where: { 
      OR: [
        { 
          registrationStatus: RegistrationStatus.STARTED,
          registrationTxId: null
        },
        { 
          registrationStatus: RegistrationStatus.FAILED,
        }
      ]
    }
  }); 
  res.status(200).json(result)
}
