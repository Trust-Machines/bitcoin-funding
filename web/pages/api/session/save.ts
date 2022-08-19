import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '@/common/session/index';
import { PrismaClient } from '@prisma/client';
 
async function saveSessionRoute(req: NextApiRequest, res: NextApiResponse) {
  const { dehydratedState } = await req.body;
 
  if (!dehydratedState)
    return res.status(500).json({
      message: 'No dehydratedState found in request body',
    });
 
  try {
    req.session.dehydratedState = dehydratedState;
    await req.session.save();

    // create User here if user does not exist yet
    const account = JSON.parse(dehydratedState)[1][1][0];
    const prisma = new PrismaClient();
    let user = await prisma.user.findUnique({ where: { appPrivateKey: account['appPrivateKey'] } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          appPrivateKey: account['appPrivateKey'], // TODO: we should probably hash this before saving this in plain-text to our DB?
          address: account['address'],
        },
      });
    }

    res.json({ dehydratedState, user });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
 
export default withIronSessionApiRoute(saveSessionRoute, sessionOptions);
