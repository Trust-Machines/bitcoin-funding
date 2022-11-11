import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';
import aws from 'aws-sdk';

const saveToS3 = async (blob: any, contentType: string, name: string) => {
  const s3 = new aws.S3({
    accessKeyId: process.env.BF_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BF_AWS_ACCESS_KEY_SECRET
  });
  const params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    ContentType: contentType,
    Key: name,
    Body: blob
  };
  const result = await s3.upload(params).promise();
  return result;
};

export async function saveFile(file: any, name: string) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);

  if (process.env.BF_AWS_ACCESS_KEY_ID == undefined) {
    // Development: save locally
    const directory = `/avatars/${name}.${extension}`
    fs.writeFileSync(`./public/${directory}`, data);
    fs.unlinkSync(file.filepath);
    return directory;
    
  } else {
    // Production: save to S3
    try {
      fs.unlinkSync(file.filepath);
      const result = await saveToS3(data, file.mimetype, `${name}.${extension}`);
      console.log("[FILE] result:", result);
      return result.Location;
    } catch (e) {
      console.log("[FILE] error:", e);
      return '';
    }
  }
}

export async function createPlaceholderAndSaveFile(seed: string) {
  const data = createAvatar(style, { seed: seed, bold: true, fontSize: 30 });

  if (process.env.BF_AWS_ACCESS_KEY_ID == undefined) {
    // Development: save locally
    const directory = `/avatars/${seed}.svg`;
    fs.writeFileSync(`./public/${directory}`, data);
    return directory;

  } else {
    // Production: save to S3
    try {
      const result = await saveToS3(data, 'image/svg+xml', `${seed}.svg`);
      console.log("[FILE] result:", result);
      return result.Location;
    } catch (e) {
      console.log("[FILE] error:", e);
      return '';
    }
  }
}