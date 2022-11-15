import type { NextApiRequest, NextApiResponse } from 'next'
import { FundUpdateSubscription } from '@prisma/client';
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils';
import formidable from "formidable";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FundUpdateSubscription | string>
) {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<FundUpdateSubscription | string>
) {
  const body = JSON.parse(req.body);
  const { slug } = req.query;
  try {
    const resultFund = await prisma.fund.findUniqueOrThrow({ where: { slug: slug as string } });
    const account = JSON.parse(body.dehydratedState as string)[1][1][0];
    const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
    const resultUser = await prisma.user.findUniqueOrThrow({
      where: {
        appPrivateKey: hashedAppPrivateKey,
      }
    });
    const resultFundSubscription = await prisma.fundUpdateSubscription.findFirst({
      where: {
        fundId: resultFund.address as string, userId: resultUser.appPrivateKey as string
      }
    });
    let result;

    if (resultFundSubscription) {
      result = await prisma.fundUpdateSubscription.update({
        where: { id: resultFundSubscription.id },
        data: {
          fundId: resultFund.address,
          userId: resultUser.appPrivateKey,
          email: body.email,
          comment: body.comment
        },
      });
    } else {
      result = await prisma.fundUpdateSubscription.create({
        data: {
          fundId: resultFund.address,
          userId: resultUser.appPrivateKey,
          email: body.email,
          comment: body.comment
        },
      });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("[API] ERROR:", { directory: __dirname, error: error });
    res.status(400).json((error as Error).message);
  }
}
