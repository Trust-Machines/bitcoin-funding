import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao } from '@prisma/client';
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils';
import formidable from "formidable";
import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';
import slugify from 'slugify';

export const config = {
  api: {
    bodyParser: false
  }
};

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
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    try {
      // Check if user is admin
      const resultDao = await prisma.dao.findUnique({ where: { slug: fields.slug as string } });
      const account = JSON.parse(fields.dehydratedState as string)[1][1][0];
      const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
      const isAdmin = await prisma.daoAdmin.findFirst({ 
        where: { 
          daoId: resultDao!.address,
          userId: hashedAppPrivateKey
        } 
      });
      if (!isAdmin) {
        res.status(422).json('User is not admin');
        return;
      }

      // Check existing
      const slug = slugify(fields.name as string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
      if (resultDao!.name != fields.name) {
        let existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
        if (existingDao) {
          res.status(422).json('DAO with that name already exists');
          return;
        }
      }

      // Avatar
      let avatar = resultDao!.avatar;
      if (fields.updateAvatar == 'true') {
        if (files.file != undefined) { 
          avatar = await saveFile(files.file, slug as string);
        } else {
          avatar = await createPlaceholderAndSaveFile(slug as string)
        }
      }
  
      const result = await prisma.dao.update({
        where: { slug: fields.slug as string },
        data: {
          name: fields.name as string,
          about: fields.about as string,
          slug: slug,
          avatar: avatar
        },
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json((error as Error).message);
    }
  })
}

// TODO: save files to S3 in production?
// TODO: refactor to avoid code duplication with create.ts
async function saveFile(file: any, name: string) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);
  const directory = `/avatars/${name}.${extension}`
  fs.writeFileSync(`./public/${directory}`, data);
  fs.unlinkSync(file.filepath);
  return directory;
}

// TODO: save files to S3 in production?
// TODO: refactor to avoid code duplication with create.ts
async function createPlaceholderAndSaveFile(seed: string) {
  let data = createAvatar(style, {seed: seed, bold: true, fontSize: 30});
  const directory = `/avatars/${seed}.svg`;
  fs.writeFileSync(`./public/${directory}`, data);
  return directory;
}