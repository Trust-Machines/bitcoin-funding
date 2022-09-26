import type { NextApiRequest, NextApiResponse } from 'next'
import { FundMember } from '@prisma/client';
import prisma from '@/common/db';

export type MembersPaged = {
  members: FundMember[]
  total: number
  totalPages: number
  currentPage: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MembersPaged | string>
) {
  if (req.method === 'GET') {
    await getHandler(req, res);
  } else {
    res.status(400).json("Unsupported method: " + req.method);
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<MembersPaged>
) {
  const { slug, page } = req.query;
  const pageSize = 15;

  const resultFund = await prisma.fund.findUniqueOrThrow({
    where: {
      slug: slug as string,
    }
  });

  const resultMembers = await prisma.fundMember.findMany({
    orderBy : {
      updatedAt: "desc"
    },
    skip: parseInt(page as string) * pageSize,
    take: pageSize,
    where: {
      fundAddress: resultFund.address,
    },
  });  

  const memberCount = await prisma.fundMember.aggregate({
    where: {
      fundAddress: resultFund.address,
    },
    _count: true,
  });
  
  res.status(200).json({
    members: resultMembers,
    total: memberCount._count,
    totalPages: Math.ceil(memberCount._count / pageSize),
    currentPage: parseInt(page as string)
  })
}
