import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, User } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const { appPrivateKey } = req.query;
    const prisma = new PrismaClient();
    const result = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: appPrivateKey as string,
      }
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<User | string>
) {
  try {
    const body = JSON.parse(req.body)
    const prisma = new PrismaClient();
    const result = await prisma.user.create({
      data: {
        appPrivateKey: body.appPrivateKey,
        address: body.address,
        fundingWallet: {
          connect: {
            publicKey: body.fundingWallet, // TODO: should come from SC
          }
        }
      },
    });
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
