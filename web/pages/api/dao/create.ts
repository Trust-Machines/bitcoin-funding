import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client'
import slugify from 'slugify'
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils'

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
    const slug = slugify(req.body.dao.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    
    let existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
    if (existingDao) {
      res.status(422).json('DAO with that name already exists');
      return;
    }

    existingDao = await prisma.dao.findUnique({ where: { address: req.body.dao.address } });
    if (existingDao) {
      res.status(422).json('DAO with that address already exists');
      return;
    }

    const account = JSON.parse(req.body.dehydratedState)[1][1][0];
    const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey'])
    const user = await prisma.user.findUnique({ where: { appPrivateKey: hashedAppPrivateKey } });
    if (!user) {
      res.status(422).json('User does not exist');
    }

    // Save DAO in DB
    const result = await prisma.dao.create({
      data: {
        address: req.body.dao.address,
        name: req.body.dao.name,
        slug: slug,
        about: req.body.dao.about,
        raisingAmount: parseFloat(req.body.dao.raisingAmount),
        raisingDeadline: new Date(req.body.dao.raisingDeadline),
        admins: { create: [{ user: { connect: { appPrivateKey: hashedAppPrivateKey } } }] },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
