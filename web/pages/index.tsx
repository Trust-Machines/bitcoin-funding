import type { NextPage } from 'next'
import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'

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
