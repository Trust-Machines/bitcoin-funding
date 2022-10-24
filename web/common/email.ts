import fs from "fs";
import aws from 'aws-sdk';
import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, text: string) => {
  
  const ses = new aws.SES({
    accessKeyId: process.env.BF_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BF_AWS_ACCESS_KEY_SECRET,
    region: "us-east-1"
  });

  const mailer = nodemailer.createTransport({ SES: ses });

  await mailer.sendMail({
    from: `OrangeFund.us <noreply@orangefund.us>`,
    to: "hello@nieldeckx.be",
    subject: "Your Sign-In Link",
    text: `Hi there,`,
  });

};
