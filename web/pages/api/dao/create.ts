import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';

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
    const result = await prisma.dao.create({
      data: {
        publicKey: req.body.publicKey,
        title: req.body.title,
        about: req.body.about,
        amount: parseFloat(req.amount) * 100000000, // convert to sats
        registrationTxId: req.body.registrationTxId,
        registrationStatus: 'started'
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
