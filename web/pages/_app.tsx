import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'focus-visible'
import * as MicroStacks from '@micro-stacks/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MicroStacks.ClientProvider
      appName="BallotBox Funding"
      appIconUrl="APP_ICON.png"
    >
      <Component {...pageProps} />
    </MicroStacks.ClientProvider>
  );
}

export default MyApp
