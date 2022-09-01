import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  if (req.method === 'PATCH' || req.method === 'PUT') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  try {
    const { slug } = req.query;
    
    // Check if user is admin
    const resultDao = await prisma.dao.findUnique({ where: { slug: slug as string } });
    const account = JSON.parse(req.body.dehydratedState)[1][1][0];
    const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
    const isAdmin = await prisma.daoAdmin.findFirst({ 
      where: { 
        daoId: resultDao!.address,
        userId: hashedAppPrivateKey
      } 
    });
    if (!isAdmin) {
      res.status(422).json('User is not admin');
      return;
    }

    const result = await prisma.dao.update({
      where: { slug: slug as string },
      data: {
        name: req.body.dao.name,
        about: req.body.dao.about,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
