import type { NextPage } from 'next'
import { useAuth } from '@micro-stacks/react';
import { useEffect, useState } from 'react'

import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'
import { User } from '@/components/User'

import { getServerSideProps } from '@/common/session/index'

const Home: NextPage = ({ dehydratedState }) => {
  return (
    <main>
      <User dehydratedState={dehydratedState}/>
    </main>
  )
}

export { getServerSideProps };
export default Home
