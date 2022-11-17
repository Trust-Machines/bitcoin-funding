import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

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
  res: NextApiResponse<boolean>
) {
  const { slug, dehydratedState } = req.query;
  const resultFund = await prisma.fund.findUniqueOrThrow({
    where: {
      slug: slug as string,
    },
    include: { subscriptions: true }
  });
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
    let csvFile = "email,comment\n";
    // TODO: include tx ID and amount of sats funded?
    resultFund.subscriptions.forEach((subscription) => {
      csvFile = csvFile.concat(`${subscription.email},${subscription.comment}\n`);
    });

    res.status(200)
      .setHeader("Content-Type", "text/csv")
      .setHeader("Content-Disposition", `attachment; filename=${filename}`)
      .send(csvFile);
  } catch (error) {
    res.status(400).json({ error });
  }
}
