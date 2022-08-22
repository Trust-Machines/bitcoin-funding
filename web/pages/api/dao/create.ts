import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db';

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
    const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
    if (existingDao) {
      res.status(422).json('DAO with that name already exists');
      return;
    }

    const result = await prisma.dao.create({
      data: {
        address: req.body.address,
        name: req.body.name,
        slug: slug,
        about: req.body.about,
        raisingAmount: parseFloat(req.body.raisingAmount),
        raisingDeadline: new Date(req.body.raisingDeadline),
        registrationTxId: req.body.registrationTxId.toString(),
        registrationStatus: 'started',
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
