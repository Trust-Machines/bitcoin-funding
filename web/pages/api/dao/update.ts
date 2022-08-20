import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Dao } from '@prisma/client';
import slugify from 'slugify';

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
    const prisma = new PrismaClient();

    const result = await prisma.dao.create({
      data: {
        name: req.body.name,
        about: req.body.about,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
