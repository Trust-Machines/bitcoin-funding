import type { NextApiRequest, NextApiResponse } from 'next'
import { Dao, RegistrationStatus } from '@prisma/client';
import slugify from 'slugify';
import prisma from '@/common/db';
import formidable from "formidable";
import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';

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
  form.parse(req, async function (err, fields, files) {
    try {

      // Check existing
      const slug = slugify(fields.name as string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
      const existingDao = await prisma.dao.findUnique({ where: { slug: slug } });
      if (existingDao) {
        res.status(422).json('DAO with that name already exists');
        return;
      }

      // Avatar
      let avatar = "";
      if (files.file != undefined) { 
        avatar = await saveFile(files.file);
      } else {
        avatar = await createPlaceholderAndSaveFile(slug)
      }
      // TODO: save avatar in DB

      // Save info
      const result = await prisma.dao.create({
        data: {
          address: fields.address,
          name: fields.name,
          slug: slug,
          about: fields.about,
          raisingAmount: parseInt(fields.raisingAmount as string),
          raisingDeadline: new Date(fields.raisingDeadline as string),
          registrationTxId: fields.registrationTxId.toString(),
          registrationStatus: RegistrationStatus.STARTED,
        },
      });
      res.status(200).json(result);

    } catch (error) {
      res.status(400).json((error as Error).message);
    }
  });
}

// TODO: save files to S3 in production?
async function saveFile(file: any) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);
  const directory = `/avatars/${file.newFilename}.${extension}`
  fs.writeFileSync(`./public/${directory}`, data);
  fs.unlinkSync(file.filepath);
  return directory;
}

// TODO: save files to S3 in production?
async function createPlaceholderAndSaveFile(seed: string) {
  let data = createAvatar(style, {seed: seed, bold: true});
  const directory = `/avatars/${seed}.svg`;
  fs.writeFileSync(`./public/${directory}`, data);
  return directory;
}
