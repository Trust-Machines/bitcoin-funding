import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db';
import formidable from "formidable";
import { hashAppPrivateKey } from '@/common/stacks/utils';
import { createPlaceholderAndSaveFile, saveFile } from '@/common/files';
import fs from "fs";
import { registerFund } from './[slug]/register';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  if (req.method === 'POST') {
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
  await new Promise(function (resolve, reject) {
    form.parse(req, async function (err, fields, files) {
      try {
        // Check existing
        const slug = slugify(fields.name as string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        let existingDao = await prisma.fund.findUnique({ where: { slug: slug } });
        if (existingDao) {
          res.status(422).json('DAO with that name already exists');
          return;
        }
        existingDao = await prisma.fund.findUnique({ where: { address: fields.address as string } });
        if (existingDao) {
          res.status(422).json('DAO with that address already exists');
          return;
        }

        const account = JSON.parse(fields.dehydratedState as string)[1][1][0];
        const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
        const user = await prisma.user.findUnique({ where: { appPrivateKey: hashedAppPrivateKey } });
        if (!user) {
          res.status(422).json('User does not exist');
          return;
        }

        // Avatar
        let avatar = '';
        if (files.file) {
          const stats = fs.statSync(files.file.filepath);
          if (stats.size > 5000000 || !stats.isFile()) { // ~5MB
            res.status(422).json('The chosen avatar is too big (max 5mb)');
            return;
          }
          avatar = await saveFile(files.file, slug);
        } else {
          avatar = await createPlaceholderAndSaveFile(slug);
        }

        // Save info
        await prisma.fund.create({
          data: {
            address: fields.address as string,
            name: fields.name as string,
            slug: slug,
            avatar: avatar,
            about: fields.about as string,
            raisingAmount: parseInt(fields.raisingAmount as string),
            raisingDeadline: new Date(fields.raisingDeadline as string),
            admins: { create: [{ user: { connect: { appPrivateKey: hashedAppPrivateKey } } }] },
          },
        });

        let result = await registerFund(slug);
        res.status(200).json(result);
      } catch (error) {
        console.log("[API] ERROR:", { directory: __dirname, error: error });
        res.status(400).json((error as Error).message);
      }
    });
  });
}
