import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao, RegistrationStatus } from '@prisma/client'
import slugify from 'slugify'
import prisma from '@/common/db'
import { registerDao } from '@/common/stacks/dao-registry-v1-1'

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
    // TODO: replace with singleton
    const client = new PrismaClient();
    const slug = slugify(req.body.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    
    let existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
    if (existingDao) {
      // TODO: replace with slugify that adds a number to the end, DAO names shouldn't be unique
      res.status(422).json('DAO with that name already exists');
      return;
    }

    existingDao = await prisma.dao.findUnique({ where: { address: req.body.address } });
    if (existingDao) {
      res.status(422).json('DAO with that address already exists');
      return;
    }

    // Register on chain
    // TODO: perform in background if broadcasting TX takes too long
    const registrationResult = await registerDao(req.body.address);
    const registrationTxId = registrationResult.txid;
    if (registrationTxId == undefined) {
      res.status(422).json('DAO could not be registered on chain');
      return;
    }

    const account = JSON.parse(req.body.dehydratedState)[1][1][0];
    const user = await client.user.findUnique({ where: { appPrivateKey: account['appPrivateKey'] } });
    if (!user) {
      // TODO: throw error or create user?
    }
    data.admins = { create: [{ userId: user['appPrivateKey'] }] };

    // Save in DB
    const result = await prisma.dao.create({
      data: {
        address: req.body.address,
        name: req.body.name,
        slug: slug,
        about: req.body.about,
        raisingAmount: parseFloat(req.body.raisingAmount),
        raisingDeadline: new Date(req.body.raisingDeadline),
        registrationTxId: registrationTxId,
        registrationStatus: RegistrationStatus.STARTED,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
