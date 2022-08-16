import type { NextPage } from 'next'
import { useAuth } from '@micro-stacks/react';
import { useEffect, useState } from 'react'

import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'
import { Main } from '@/components/Main'

const Home: NextPage = () => {
  const { isSignedIn } = useAuth();
  const [isAuthenticated, setAuthenticated] = useState(false);

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
