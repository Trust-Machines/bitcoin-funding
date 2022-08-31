import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao, RegistrationStatus } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db';
import { registerDao } from '@/common/stacks/dao-registry-v1-1';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  if (req.method === 'POST') {
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
    const slug = slugify(req.body.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    
    let existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
    if (existingDao) {
      res.status(422).json('DAO with that name already exists');
      return;
    }

    existingDao = await prisma.dao.findUnique({ where: { address: req.body.address } });
    if (existingDao) {
      res.status(422).json('DAO with that address already exists');
      return;
    }

    // Save in DB
    const result = await prisma.dao.create({
      data: {
        address: req.body.address,
        name: req.body.name,
        slug: slug,
        about: req.body.about,
        raisingAmount: parseFloat(req.body.raisingAmount),
        raisingDeadline: new Date(req.body.raisingDeadline),
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
