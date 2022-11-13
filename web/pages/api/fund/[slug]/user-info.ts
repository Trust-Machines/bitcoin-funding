import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils';
import formidable from "formidable";
import slugify from 'slugify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    try {
      const resultFund = await prisma.fund.findUniqueOrThrow({ where: { slug: fields.slug as string } });
      const account = JSON.parse(fields.dehydratedState as string)[1][1][0];
      const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
      const resultUser = await prisma.user.findUniqueOrThrow({
        where: {
          appPrivateKey: hashedAppPrivateKey,
        }
      });

      const result = await prisma.fundUpdateSubscription.upsert({
        where: { fundId: existingFund.slug as string, userId: resultUser.appPrivateKey as string },
        data: {
          fundId: existingFund.address,
          userId: resultUser.appPrivateKey,
          email: fields.email,
          comment: fields.comment
        },
      });
      res.status(200).json(result);
    } catch (error) {
      console.log("[API] ERROR:", { directory: __dirname, error: error });
      res.status(400).json((error as Error).message);
    }
  })
}
