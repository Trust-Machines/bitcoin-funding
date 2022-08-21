import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client'
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
    prisma.$use(async (params, next) => {
      console.log(params)
      if (params.action === 'create') {
        const { args: { data } } = params;
        console.log(data);
        const slug = slugify(`${data.name}`, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        console.log(slug);
        const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          return res.status(422).json('DAO with that name already exists');
        }
        console.log(data);
        data.slug = slug;

    //     const account = JSON.parse(req.dehydratedState)[1][1][0];
    //     let user = await prisma.user.findUnique({ where: { appPrivateKey: account['appPrivateKey'] } });
    //     console.log('found user:', user);
    //     if (!user) {
    //       // throw error
    //     }
    //     data.user = user;

        const result = await next(params);
        return result;
      }
    });

    const result = await prisma.dao.create({
      data: {
        publicKey: req.body.dao.publicKey,
        name: req.body.dao.name,
        about: req.body.dao.about,
        raisingAmount: parseFloat(req.body.dao.raisingAmount) * 100000000, // convert to sats
        raisingDeadline: new Date(req.body.dao.deadline),
        registrationTxId: req.body.dao.registrationTxId.toString(),
        registrationStatus: 'started',
        admins: {
          create: [
            { user: req.body.user }
          ]
        }
      },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
