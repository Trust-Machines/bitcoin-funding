import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'focus-visible'
import * as MicroStacks from '@micro-stacks/react';
import { Header } from '@/components/Header'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MicroStacks.ClientProvider
      appName="BallotBox Funding"
      appIconUrl="APP_ICON.png"
    >
      <Head>
        <title>BallotBox - Funding</title>
        <meta name="description" content="Fund your Bitcoin DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isAuthenticated={true} />
      <Component {...pageProps} />
    </MicroStacks.ClientProvider>
  );
}

export default MyApp
