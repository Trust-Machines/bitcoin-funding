import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client'
import slugify from 'slugify'
import prisma from '@/common/db'

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
    const client = new PrismaClient();
    prisma.$use(async (params, next) => {
      if (params.action === 'create') {
        const { args: { data } } = params;
        const slug = slugify(`${data.name}`, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          console.log('TODO: DAO already exists... generate unique slug');
        }
        data.slug = slug;

        const account = JSON.parse(req.body.dehydratedState)[1][1][0];
        const user = await client.user.findUnique({ where: { appPrivateKey: account['appPrivateKey'] } });
        if (!user) {
          // throw error
        }
        data.admins = { create: [{ userId: user['appPrivateKey'] }] };

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
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
