import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'focus-visible'
import { ClientProvider } from '@micro-stacks/react';

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import Head from 'next/head'
import { useCallback } from 'react';
import { destroySession, saveSession } from '@/common/fetchers';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      setAuthenticated(pageProps?.dehydratedState);
      setIsLoading(false);
    }
  }, [pageProps?.dehydratedState, isLoading]);

  return (
    <ClientProvider
      appName="BallotBox Funding"
      appIconUrl="APP_ICON.png"
      dehydratedState={pageProps?.dehydratedState}
      network={process.env.NEXT_PUBLIC_NETWORK}
      onPersistState={useCallback(async (dehydratedState: string) => {
        pageProps.dehydratedState = dehydratedState;
        setAuthenticated(true);
        await saveSession(dehydratedState);
      }, [])}
      onSignOut={useCallback(async () => {
        setAuthenticated(false);
        await destroySession();
      }, [])}
    >
      <Head>
        <title>BallotBox - Funding</title>
        <meta name="description" content="Fund your Bitcoin Fund" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isAuthenticated={isAuthenticated} />
      <Component {...pageProps} />
      <Footer />
    </ClientProvider>
  );
}

export default MyApp
