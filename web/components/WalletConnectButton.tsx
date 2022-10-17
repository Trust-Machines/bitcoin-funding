import { useEffect, useState } from 'react'
import { useAccount, useAuth } from '@micro-stacks/react';
import { Button } from '@/components/Button';
import { DownloadWalletModal } from '@/components/DownloadWalletModal';

const shortAddress = (address: string | null) => {
  if (address) {
    if (address.includes('.')) {
      return address;
    }
    return `${address.substring(0, 5)}...${address.substring(address.length, address.length - 5)}`;
  }

  return '';
};

const useHover = () => {
  const [hovering, setHovering] = useState(false);
  const onHoverProps = {
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  }
  return [hovering, onHoverProps]
}

export const WalletConnectButton = ({ buttonText }) => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const [label, setLabel] = useState(buttonText);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const account = useAccount();
  const [buttonHover, buttonHoverProps] = useHover();

  useEffect(() => {
    setLabel(isRequestPending ? 'Loading...' : isSignedIn ? shortAddress(account.stxAddress) : buttonText);
  }, [isRequestPending, isSignedIn]);

  return (
    <>
      {showDownloadModal ? (
        <DownloadWalletModal showDownloadModal={showDownloadModal} setShowDownloadModal={setShowDownloadModal} />
      ) : null}
      <Button {...buttonHoverProps}
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
        {isSignedIn ? (
          <span className="flex items-center w-36 ml-3">
            {buttonHover ? (
              <span className="flex items-center">
                <span className="truncate text-md ml-1">Sign Out</span>
              </span>
            ) : (
              <>
                <span className="block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white mr-3" />
                <span className="truncate">{label}</span>
              </>
            )}
          </span>
        ) : (
          <>
            {label}
          </>
        )}
      </Button>
    </>
  );
};
