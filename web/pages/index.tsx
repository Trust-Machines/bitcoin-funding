import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>BallotBox - Funding</title>
        <meta name="description" content="Fund your Bitcoin DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>
        <Hero />
        <hr className="mt-4" />
        <HomeGrid />
      </main>

      <Footer />
    </div>
  )
}

export default Home
