import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '@/common/session';
 
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
    res.json({ dehydratedState });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
 
export default withIronSessionApiRoute(saveSessionRoute, sessionOptions);
