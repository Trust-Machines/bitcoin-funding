import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Dao | string>,
) {
  try {
    const { slug } = req.query;
    const result = await prisma.dao.findUniqueOrThrow({
      where: {
        slug: slug as string,
      }
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
