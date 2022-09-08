import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';
import aws from 'aws-sdk';

// TODO: save files to S3 in production?
export async function saveFile(file: any, name: string) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);
  fs.unlinkSync(file.filepath);

  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    });
    const params = {
      ACL: 'public-read',
      Bucket: 'bitcoin-funding-test',
      Key: `${name}.${extension}`,
      Body: data
    };
    const result = await s3.upload(params).promise();

    return result.Location;
  } catch (e) {
    console.log(e);
    return '';
  }
}

// TODO: can replace this with https://avatars.dicebear.com/api/initials/slug.svg
export async function createPlaceholderAndSaveFile(seed: string) {
  let data = createAvatar(style, {seed: seed, bold: true, fontSize: 30});
  const directory = `/avatars/${seed}.svg`;
  fs.writeFileSync(`./public/${directory}`, data);
  return directory;
}