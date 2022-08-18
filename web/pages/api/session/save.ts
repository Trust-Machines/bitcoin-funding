import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '@/common/session/index';
 
async function saveSessionRoute(req: NextApiRequest, res: NextApiResponse) {
  const { dehydratedState } = await req.body;
 
  if (!dehydratedState)
    return res.status(500).json({
      message: 'No dehydratedState found in request body',
    });
 
  try {
    console.log('setting state to', dehydratedState);
    req.session.dehydratedState = dehydratedState;
    await req.session.save();

    // TODO: create User here through middleware if user does not exist yet
    // const prisma = new PrismaClient();
    // const existingUser = await prisma.user.findUnique({ where: { appPrivateKey: slug } });

    // const result = await prisma.user.create({
    //   data: {
    //     appPrivateKey: req.body.appPrivateKey,
    //     address: req.body.address,
    //     registrationTxId: req.body.registrationTxId,
    //     registrationStatus: 'started'
    //   },
    // });

    res.json({ dehydratedState });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
 
export default withIronSessionApiRoute(saveSessionRoute, sessionOptions);
