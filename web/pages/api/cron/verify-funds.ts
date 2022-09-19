import { RegistrationStatus } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { verifyFund } from '../fund/[slug]/verify';

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
  const unverified = await prisma.fund.findMany({
    where: { registrationStatus: RegistrationStatus.STARTED }
  });  

  // Try to verify all
  for (const fund of unverified) {
    try {
      let result = await verifyFund(fund.slug);
      console.log("[VERIFY FUND] verification response:", result);
    } catch (error) {
      console.log("[VERIFY FUND] ERROR:", error);
    }
  }

  res.status(200).json("Unverified funds: " + unverified.length);
}
