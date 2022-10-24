import type { NextPage } from 'next'
import { useAuth } from '@micro-stacks/react';
import { useEffect, useState } from 'react'

import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'
import { Main } from '@/components/User'

import { getServerSideProps } from '@/common/session/index'

const Home: NextPage = () => {
  return (
    <main>
      <Hero />
      <hr className="mt-4" />
      <HomeGrid />
    </main>
  )
}

export { getServerSideProps };
export default Home
