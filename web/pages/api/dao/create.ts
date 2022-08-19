import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';
import slugify from 'slugify';

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
    const prisma = new PrismaClient();

    prisma.$use(async (params, next) => {
      if (params.action === 'create') {
        const { args: { data } } = params;
        const slug = slugify(`${data.name}`, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          res.status(422).json('DAO with that name already exists');
        }
        data.slug = slug;

        const result = await next(params);
        return result;
      }
    });

    const result = await prisma.dao.create({
      data: {
        publicKey: req.body.publicKey,
        name: req.body.name,
        about: req.body.about,
        raisingAmount: parseFloat(req.body.raisingAmount) * 100000000, // convert to sats
        raisingDeadline: new Date(req.body.deadline),
        registrationTxId: req.body.registrationTxId.toString(),
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
