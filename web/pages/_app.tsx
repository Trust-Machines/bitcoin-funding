import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'focus-visible'
import { ClientProvider } from '@micro-stacks/react';
import { Header } from '@/components/Header'
import Head from 'next/head'
import { useCallback } from 'react';
import { destroySession, saveSession } from '@/common/fetchers';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClientProvider
      appName="BallotBox Funding"
      appIconUrl="APP_ICON.png"
      dehydratedState={pageProps?.dehydratedState}
      onPersistState={useCallback(async (dehydratedState: string) => {
        await saveSession(dehydratedState);
      }, [])}
      onSignOut={useCallback(async () => {
        await destroySession();
      }, [])}
    >
      <Head>
        <title>BallotBox - Funding</title>
        <meta name="description" content="Fund your Bitcoin DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isAuthenticated={true} />
      <Component {...pageProps} />
    </ClientProvider>
  );
}

export default MyApp
