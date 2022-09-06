import fs from "fs";
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-initials-sprites';

// TODO: save files to S3 in production?
export async function saveFile(file: any, name: string) {
  const extension = file.originalFilename.split(".").pop();
  const data = fs.readFileSync(file.filepath);
  const directory = `/avatars/${name}.${extension}`
  fs.writeFileSync(`./public/${directory}`, data);
  fs.unlinkSync(file.filepath);
  return directory;
}

// TODO: save files to S3 in production?
export async function createPlaceholderAndSaveFile(seed: string) {
  let data = createAvatar(style, {seed: seed, bold: true, fontSize: 30});
  const directory = `/avatars/${seed}.svg`;
  fs.writeFileSync(`./public/${directory}`, data);
  return directory;
}