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

import { setSession } from '@/common/session/index';

function MyApp({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      setAuthenticated(pageProps?.dehydratedState);
      setIsLoading(false);
    }
  }, [pageProps?.dehydratedState]);

  return (
    <ClientProvider
      appName="BallotBox Funding"
      appIconUrl="APP_ICON.png"
      dehydratedState={pageProps?.dehydratedState}
      onPersistState={useCallback(async (dehydratedState: string) => {
        setAuthenticated(true);
        const result = await saveSession(dehydratedState);
        setSession(result);
      }, [])}
      onSignOut={useCallback(async () => {
        setAuthenticated(false);
        await destroySession();
        router.push('/');
        setSession(null);
      }, [])}
    >
      <Head>
        <title>BallotBox - Funding</title>
        <meta name="description" content="Fund your Bitcoin DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isAuthenticated={isAuthenticated} />
      <Component {...pageProps} />
      <Footer />
    </ClientProvider>
  );
}

export default MyApp
