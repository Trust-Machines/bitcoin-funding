import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '@/common/session/index';
import prisma from '@/common/db';
import { hashAppPrivateKey } from '@/common/stacks/utils';

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
    const hashedAppPrivateKey = await hashAppPrivateKey(account['appPrivateKey'])
    let user = await prisma.user.findUnique({ where: { appPrivateKey: hashedAppPrivateKey } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          appPrivateKey: hashedAppPrivateKey,
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
