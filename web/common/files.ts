import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';
import aws from 'aws-sdk';

const saveToS3 = async (blob: any, name: string) => {
  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
  });
  const params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: name,
    Body: blob
  };
  const result = await s3.upload(params).promise();

  return result;
};

export async function saveFile(file: any, name: string) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);
  fs.unlinkSync(file.filepath);

  try {
    const result = await saveToS3(data, `${name}.${extension}`);
    return result.Location;
  } catch (e) {
    console.log(e);
    return '';
  }
}

export async function createPlaceholderAndSaveFile(seed: string) {
  try {
    const data = createAvatar(style, {seed: seed, bold: true, fontSize: 30});
    const result = await saveToS3(data, `${seed}.svg`);
    return result.Location;
  } catch (e) {
    console.log(e);
    return '';
  }
}