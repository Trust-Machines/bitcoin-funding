import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';
import { resolveBns, shortAddress } from '@/common/utils';
import { RegistrationStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | string>
) {
  const { slug, dehydratedState } = req.query;

  // Get fund
  const resultFund = await prisma.fund.findUniqueOrThrow({
    where: { slug: slug as string },
    include: { subscriptions: {
      include: { user: true }
    } }
  });

  // Get fund transactions
  const resultTransactions = await prisma.fundingTransaction.findMany({
    where: {
      fundAddress: resultFund.address,
      registrationStatus: RegistrationStatus.COMPLETED
    }
  });  

  // Check if user is admin
  const account = JSON.parse(dehydratedState as string)[1][1][0];
  const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey'])
  const isAdmin = await prisma.fundAdmin.findFirst({ 
    where: { 
      fundId: resultFund.address,
      userId: hashedAppPrivateKey
    }
  });
  if (!isAdmin) {
    return res.status(403).json('Not allowed');
  }

  try {
    const filename = `${resultFund.slug}-export.csv`;
    let csvFile = "email,comment,address,bns,timestamp,sats\n";

    for (const subscription of resultFund.subscriptions) {      
      const resolvedBns = await resolveBns(subscription.user.address);
      const bns = resolvedBns == shortAddress(subscription.user.address) ? "" : resolvedBns;
      const userTransactions = resultTransactions.filter(tx => tx.userAddress == subscription.user.address);

      const userInfo = `${subscription.email},${subscription.comment},${subscription.user.address},${bns}`;
      if (userTransactions.length == 0) {
        csvFile = csvFile.concat(`${userInfo},,\n`);
      } else {
        for (const transaction of userTransactions) {
          csvFile = csvFile.concat(`${userInfo},${transaction.createdAt},${transaction.sats}\n`);
        }
      }
    }

    res.status(200)
      .setHeader("Content-Type", "text/csv")
      .setHeader("Content-Disposition", `attachment; filename=${filename}`)
      .send(csvFile);
  } catch (error) {
    res.status(400).json((error as Error).message);
  }
}
