import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db';
import formidable from "formidable";
import { hashAppPrivateKey } from '@/common/stacks/utils';
import { createPlaceholderAndSaveFile, saveFile } from '@/common/files';

export const config = {
  api: {
    bodyParser: false
  }
};

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
  const form = new formidable.IncomingForm();
  await new Promise(function (resolve, reject) {
    form.parse(req, async function (err, fields, files) {
      try {
        // Check existing
        const slug = slugify(fields.name as string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        let existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          res.status(422).json('DAO with that name already exists');
          return;
        }
        existingDao = await prisma.dao.findUnique({ where: { address: fields.address as string } });
        if (existingDao) {
          res.status(422).json('DAO with that address already exists');
          return;
        }

        const account = JSON.parse(fields.dehydratedState as string)[1][1][0];
        const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
        const user = await prisma.user.findUnique({ where: { appPrivateKey: hashedAppPrivateKey } });
        if (!user) {
          res.status(422).json('User does not exist');
        }

        // Avatar
        let avatar = "";
        if (files.file != undefined) {
          avatar = await saveFile(files.file, slug);
        } else {
          avatar = await createPlaceholderAndSaveFile(slug);
        }

        // Save info
        const result = await prisma.dao.create({
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
        res.status(200).json(result);

      } catch (error) {
        res.status(400).json((error as Error).message);
      }
    });
  });
}
