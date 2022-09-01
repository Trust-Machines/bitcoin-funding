import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<boolean>
) {
  const { slug, dehydratedState } = req.query;
  const resultDao = await prisma.dao.findUniqueOrThrow({
    where: {
      slug: slug as string,
    }
  });

  const account = JSON.parse(dehydratedState as string)[1][1][0];
  const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey'])
  const isAdmin = await prisma.daoAdmin.findFirst({ 
    where: { 
      daoId: resultDao.address,
      userId: hashedAppPrivateKey
    } 
  });
  res.status(200).json(isAdmin ? true : false)
}
