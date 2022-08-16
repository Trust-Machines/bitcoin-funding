import { useEffect, useState } from 'react'
import { useAuth } from '@micro-stacks/react';
import { Button } from '@/components/Button'
 
export const WalletConnectButton = ({ buttonText }) => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const [label, setLabel] = useState(buttonText);

  useEffect(() => {
    setLabel(isRequestPending ? 'Loading...' : isSignedIn ? 'Sign out' : buttonText);
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
