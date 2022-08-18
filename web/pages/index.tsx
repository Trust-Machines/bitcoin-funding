import type { NextPage, GetServerSidePropsContext } from 'next'
import { useAuth } from '@micro-stacks/react';
import { useEffect, useState } from 'react'

import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'
import { Main } from '@/components/Main'

import { getDehydratedStateFromSession } from '@/common/session/helpers';

// https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const Home: NextPage = ({ dehydratedState }) => {
  const { isSignedIn } = useAuth();
  const [isAuthenticated, setAuthenticated] = useState(dehydratedState && dehydratedState.length > 0);

  useEffect(() => {
    setAuthenticated(isSignedIn);
  }, [isSignedIn]);

  return (
    <>
      <main>
        {isAuthenticated ? (
          <Main />
        ) : (
          <>
            <Hero />
            <hr className="mt-4" />
            <HomeGrid />
          </>
        )}
      </main>

      <Footer />
    </>
  )
}

export default Home
