import type { NextPage, GetServerSidePropsContext } from 'next'
import { useAuth } from '@micro-stacks/react';
import { useEffect, useState } from 'react'

import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'
import { Main } from '@/components/Main'

import { getServerSideProps } from '@/common/session/index'

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
    </>
  )
}

export { getServerSideProps };
export default Home
