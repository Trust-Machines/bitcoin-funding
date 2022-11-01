import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'focus-visible'
import { ClientProvider } from '@micro-stacks/react';

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import Head from 'next/head'
import { useCallback } from 'react';
import { destroySession, saveSession, findUser } from '@/common/fetchers';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { StacksSessionState } from 'micro-stacks/connect';
import { User, RegistrationStatus } from '@prisma/client';
import { WelcomeModal } from '@/components/WelcomeModal';

const stxNetwork = process.env.NEXT_PUBLIC_NETWORK;

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [appPrivateKey, setAppPrivateKey] = useState("");
  const [user, setUser] = useState<User>({});
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async (appPrivateKey : string) => {
      const userInfo = await findUser(appPrivateKey as string);

      if (userInfo.registrationStatus === RegistrationStatus.STARTED && !userInfo.registrationTxId) {
        setShowWelcomeModal(true);
      }

      setUser(userInfo);
    };

    var userAppPrivateKey = appPrivateKey;
    if (!userAppPrivateKey && pageProps?.dehydratedState) {
      const stateJson = JSON.parse(pageProps?.dehydratedState);
      if (stateJson[1] && stateJson[1][1] && stateJson[1][1][0]) {
        const appPrivateKey = stateJson[1][1][0]['appPrivateKey'];
        userAppPrivateKey = appPrivateKey;
      }
    }

    if (isLoading && userAppPrivateKey) {
      loadUser(userAppPrivateKey);
      setIsLoading(false);
    }
  }, [pageProps?.dehydratedState, isLoading, appPrivateKey]);

  return (
    <ClientProvider
      appName="Orangefund.us"
      appIconUrl="https://www.ballotbox.xyz/logo512.png"
      dehydratedState={pageProps?.dehydratedState}
      network={stxNetwork}
      onPersistState={useCallback(async (dehydratedState: string) => {
        // Replace address by testnet address if needed
        const stateJson = JSON.parse(dehydratedState);
        stateJson[1][1][0]['address'] = pageProps.address;
        const newDehydratedState = JSON.stringify(stateJson);
        
        pageProps.dehydratedState = newDehydratedState;
        await saveSession(newDehydratedState);
        
        if (stateJson[1] && stateJson[1][1] && stateJson[1][1][0]) {
          const appPrivateKey = stateJson[1][1][0]['appPrivateKey'];
          setAppPrivateKey(appPrivateKey);
          setIsLoading(true);
        }
      }, [])}
      onAuthentication={useCallback(async (payload: StacksSessionState) => {
        const address = stxNetwork == "mainnet" ? payload.addresses.mainnet : payload.addresses.testnet;
        pageProps.address = address;
      }, [])}
      onSignOut={useCallback(async () => {
        await destroySession();
        router.push("/");
      }, [])}
    >
      <Head>
        <title>Orangefund.us</title>
        <meta name="description" content="Fund your Bitcoin Fund" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header user={user} />
      {showWelcomeModal ? (
        <WelcomeModal showWelcomeModal={showWelcomeModal} setShowWelcomeModal={setShowWelcomeModal} />
      ) : null}
      <Component {...pageProps} />
      <Footer />
    </ClientProvider>
  );
}

export default MyApp
