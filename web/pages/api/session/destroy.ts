import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '@/common/session/index';
 
function destorySessionRoute(req: NextApiRequest, res: NextApiResponse) {
  req.session.destroy();
  res.json(null);
}
 
export default withIronSessionApiRoute(destorySessionRoute, sessionOptions);
