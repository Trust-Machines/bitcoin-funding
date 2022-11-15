import { RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
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
  
  // Get all
  const users = await prisma.user.findMany({
    where: { 
      registrationStatus: RegistrationStatus.COMPLETED,
      registrationEmail: false,
      NOT: { email: null }
    }
  });  

  // Check all
  for (const user of users) {
    try {
      const emailResult = await sendMailRegistration(user.email);
      console.log("[EMAIL] send registration email:", user.email, "result:", emailResult);

      if (emailResult) {
        // Update DB
        await prisma.user.update({
          where: { address: user.address },
          data: { registrationEmail: true },
        });
      }
    } catch (error) {
      console.log("[EMAIL] ERROR:", error);
    }
  }

  res.status(200).json("Registration emails: " + users.length);
}
