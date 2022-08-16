import type { NextPage } from 'next'
import Head from 'next/head'
import * as MicroStacks from '@micro-stacks/react';

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { HomeGrid } from '@/components/HomeGrid'

const Home: NextPage = () => {
  return (
    <MicroStacks.ClientProvider
      appName="My sick app"
      appIconUrl="APP_ICON.png"
    >
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
    </MicroStacks.ClientProvider>
  )
}

export default Home
