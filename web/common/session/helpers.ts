import * as Iron from 'iron-session';
import { sessionOptions } from './index';
 
import type { NextPageContext } from 'next';
import type { GetServerSidePropsContext } from 'next/types';
 
export const getIronSession = (req: NextPageContext['req'], res: NextPageContext['res']) => {
  return Iron.getIronSession(req as any, res as any, sessionOptions);
};
 
export const getDehydratedStateFromSession = async (ctx: GetServerSidePropsContext) => {
  const { dehydratedState } = await getIronSession(ctx.req, ctx.res);
  return dehydratedState ? dehydratedState : null;
};
