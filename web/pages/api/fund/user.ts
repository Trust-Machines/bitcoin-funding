import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

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
  const { dehydratedState } = req.query;

  const account = JSON.parse(dehydratedState as string)[1][1][0];
  const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey'])

  const result = await prisma.fundAdmin.findMany({
    where: {
      userId: hashedAppPrivateKey
    }, 
    include: {
      fund: true
    }
  });

  var funds: Fund[] = [];
  for (const userFund of result) {
    funds.push(userFund.fund);
  }
  
  console.log("RESULT:", funds)

  res.status(200).json(funds);
}
