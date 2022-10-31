import type { NextPage } from 'next'
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
