import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';
const slugify = require('slugify');

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
    console.log('Got request to create DAO', req.body);
    const prisma = new PrismaClient();

    prisma.$use(async (params, next) => {
      console.log(params);
      if ((params.action === 'create' || params.action === 'update')) {
        const { args:{data} } = params;
        // Check if slug exists by `findUnique` (did not test)
        const slug = slugify(`${data.name}`, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          console.log(existingDao);
          // TODO: adjust slug or throw error - cannot make DAOs with the same slug
        }

        data.slug = slug;
      }

      const result = await next(params);
      return result;
    })

    const result = await prisma.dao.create({
      data: {
        publicKey: req.body.publicKey,
        name: req.body.name,
        about: req.body.about,
        raisingAmount: parseFloat(req.body.raisingAmount) * 100000000, // convert to sats
        raisingDeadline: new Date(req.body.deadline),
        registrationTxId: req.body.registrationTxId.toString(),
        registrationStatus: 'started'
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
