import { useEffect, useState } from 'react'
import { useAccount, useAuth } from '@micro-stacks/react';
import { Button } from '@/components/Button';
import { DownloadWalletModal } from '@/components/DownloadWalletModal';
import { resolveBns, shortAddress } from '@/common/utils'

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

  useEffect(() => {
    const fetchName = async () => {
      const name = await resolveBns(account.stxAddress);
      setLabel(name);
    };

    if (isSignedIn) {
      fetchName();
    }
  }, []);

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
          <span className="w-32 justify-items-center self-center">
            {buttonHover ? (
              <span className="truncate text-md ml-1">Sign Out</span>
            ) : (
              <span className="flex items-center ml-2">
                <span className="block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white mr-3" />
                <span className="truncate">{label}</span>
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center">
            {label}
          </span>
        )}
      </Button>
    </>
  );
};
