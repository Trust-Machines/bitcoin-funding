import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  try {
    const { slug } = req.query;
    const result = await prisma.fund.findUniqueOrThrow({
      where: {
        slug: slug as string,
      }
    });
    res.status(200).json(result)
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
