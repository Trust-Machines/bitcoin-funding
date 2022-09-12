import type { NextApiRequest, NextApiResponse } from 'next'
import { Fund } from '@prisma/client';
import prisma from '@/common/db'
import { hashAppPrivateKey } from '@/common/stacks/utils';
import formidable from "formidable";
import slugify from 'slugify';
import { createPlaceholderAndSaveFile, saveFile } from '@/common/files';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Fund | string>
) {
  if (req.method === 'PATCH' || req.method === 'PUT') {
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
      // Check if user is admin
      const resultFund = await prisma.fund.findUnique({ where: { slug: fields.slug as string } });
      const account = JSON.parse(fields.dehydratedState as string)[1][1][0];
      const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey']);
      const isAdmin = await prisma.fundAdmin.findFirst({ 
        where: { 
          fundId: resultFund!.address,
          userId: hashedAppPrivateKey
        } 
      });
      if (!isAdmin) {
        res.status(422).json('User is not admin');
        return;
      }

      // Check existing
      const slug = slugify(fields.name as string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
      const existingFund = await prisma.fund.findUnique({ where: { slug: slug } });
      if (resultFund!.name != fields.name) {
        if (existingFund) {
          res.status(422).json('Fund with that name already exists');
          return;
        }
      }

      // Avatar
      let avatar = resultFund!.avatar;
      if (fields.updateAvatar == 'true') {
        if (files.file != undefined) { 
          avatar = await saveFile(files.file, slug as string);
        } else {
          avatar = await createPlaceholderAndSaveFile(slug as string)
        }
      }

      // Admins
      const newAdmins = fields.newAdmins as string;
      if (newAdmins != '') {
        const addresses = newAdmins.split(",");
        for (const address of addresses) {

          // Check if user exist
          const resultUser = await prisma.user.findUnique({
            where: {
              address: address,
            }
          });

          if (resultUser) {
            await prisma.fundAdmin.create({
              data: {
                fundId: existingFund.address,
                userId: resultUser.appPrivateKey
              }
            })
          } else {
            await prisma.fundAdminInvite.create({
              data: {
                fundAddress: existingFund.address,
                userAddress: address,
              },
            });
          }
        }
      }
  
      // Update info
      const result = await prisma.fund.update({
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
