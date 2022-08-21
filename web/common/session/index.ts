import type { IronSessionOptions } from 'iron-session';
import { getDehydratedStateFromSession } from '@/common/session/helpers';
 
export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'micro-stacks-react',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
 
// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    dehydratedState?: string;
  }
}

// https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}
