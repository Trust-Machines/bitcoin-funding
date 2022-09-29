import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | string>
) {
  try {
    const { slug, dehydratedState } = req.query;
    const resultFund = await prisma.fund.findUniqueOrThrow({
      where: {
        slug: slug as string,
      }
    });

    const account = JSON.parse(dehydratedState as string)[1][1][0];
    const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
    const isAdmin = await prisma.fundAdmin.findFirst({ 
      where: { 
        fundId: resultFund.address,
        userId: hashedAppPrivateKey
      } 
    });
    if (!isAdmin) {
      res.status(422).json('User is not admin');
      return;
    }
    
    const resultAdmin = await prisma.fundAdmin.findMany({
      where: { fundId: resultFund.address }, 
      include: { user: true }
    })
    const resultInvite = await prisma.fundAdminInvite.findMany({
      where: { fundAddress: resultFund.address }
    })

    var resultList: string[] = [];
    for (const admin of resultAdmin) {
      resultList.push(admin.user.address);
    }
    for (const admin of resultInvite) {
      resultList.push(admin.userAddress);
    }
    res.status(200).json(resultList)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
