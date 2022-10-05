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
import { StacksSessionState } from 'micro-stacks/connect';

const stxNetwork = process.env.NEXT_PUBLIC_NETWORK;

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
      appName="Orangefund.us"
      appIconUrl="APP_ICON.png"
      dehydratedState={pageProps?.dehydratedState}
      network={stxNetwork}
      onPersistState={useCallback(async (dehydratedState: string) => {

        // Replace address by testnet address if needed
        const stateJson = JSON.parse(dehydratedState);
        stateJson[1][1][0]['address'] = pageProps.address;
        const newDehydratedState = JSON.stringify(stateJson);
        
        pageProps.dehydratedState = newDehydratedState;
        setAuthenticated(true);
        await saveSession(newDehydratedState);
      }, [])}
      onAuthentication={useCallback(async (payload: StacksSessionState) => {
        const address = stxNetwork == "mainnet" ? payload.addresses.mainnet : payload.addresses.testnet;
        pageProps.address = address;
      }, [])}
      onSignOut={useCallback(async () => {
        setAuthenticated(false);
        await destroySession();
      }, [])}
    >
      <Head>
        <title>Orangefund.us</title>
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
