import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db'

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
    const { slug } = req.query;
    // TODO: check if user is authorized to update the DAO
    const result = await prisma.dao.update({
      where: { publicKey: slug },
      data: {
        name: req.body.dao.name,
        about: req.body.dao.about,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
