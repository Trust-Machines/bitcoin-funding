import { useEffect, useState } from 'react'
import { useAuth } from '@micro-stacks/react';
import { Button } from '@/components/Button';
import { DownloadWalletModal } from '@/components/DownloadWalletModal';
 
export const WalletConnectButton = ({ buttonText }) => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const [label, setLabel] = useState(buttonText);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    setLabel(isRequestPending ? 'Loading...' : isSignedIn ? 'Sign out' : buttonText);
  }, [isRequestPending, isSignedIn]);

  return (
    <>
      {showDownloadModal ? (
        <DownloadWalletModal showDownloadModal={showDownloadModal} setShowDownloadModal={setShowDownloadModal} />
      ) : null}
      <Button
        onClick={async () => {
          if (isSignedIn) {
            await signOut();
          } else {
            try {
              await openAuthRequest();
            } catch (e) {
              // if this throws an error, likely no wallet has been installed, show modal
              setShowDownloadModal(true);
            }
          }
        }}
      >
        {label}
      </Button>
    </>
  );
};
