import { useEffect, useState } from 'react'
import { useAuth } from '@micro-stacks/react';
import { Button } from '@/components/Button'
 
export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const [label, setLabel] = useState('Connect Stacks Wallet');

  useEffect(() => {
    setLabel(isRequestPending ? 'Loading...' : isSignedIn ? 'Sign out' : 'Connect Stacks wallet');
  }, [isRequestPending, isSignedIn]);

  return (
    <Button
      onClick={async () => {
        if (isSignedIn) await signOut();
        else await openAuthRequest();
      }}
    >
      {label}
    </Button>
  );
};
