import { RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyUser } from '../user/verify';
import prisma from '@/common/db';
import { sendMailRegistration } from '@/common/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'POST') {
    await postHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  
  // Get all unverified
  const unverified = await prisma.user.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  

  // Try to verify all
  for (const user of unverified) {
    try {
      let result = await verifyUser(user.address);
      if (result.email && result.registrationStatus == RegistrationStatus.COMPLETED) {
        console.log("[VERIFY USERS] send email:", result.email);
        await sendMailRegistration(result.email);
      }
      console.log("[VERIFY USERS] verification response:", result);
    } catch (error) {
      console.log("[VERIFY USERS] ERROR:", error);
    }
  }

  res.status(200).json("Unverified users: " + unverified.length);
}
