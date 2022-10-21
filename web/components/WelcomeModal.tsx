import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { StyledIcon } from '@/components/StyledIcon'
import { registerUser } from '@/common/fetchers';
import { ButtonFundFlow } from '@/components/ButtonFundFlow';
import { useAccount } from '@micro-stacks/react';

export function WelcomeModal({ showWelcomeModal, setShowWelcomeModal }) {
  const [isSaving, setIsSaving] = useState(false);
  const [registrationStarted, setRegistrationStarted] = useState(false);
  const account = useAccount();

  const registerUserAddress = async () => {
    setIsSaving(true);
    const result = await registerUser(account.appPrivateKey as string);
    setIsSaving(false);
    setRegistrationStarted(true);
  }

  return (
    <Transition.Root show={showWelcomeModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setShowWelcomeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto mx-auto max-w-7xl">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                {registrationStarted ? (
                  <>
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <StyledIcon as="CakeIcon" size={5} className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Cowabunga!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Your Bitcoin account is being created! This will take up to 30 minutes.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <ButtonFundFlow onClick={() => { setShowWelcomeModal(false); }} saving={isSaving}>
                        Browse OrangeFund
                      </ButtonFundFlow>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <StyledIcon as="AnnotationIcon" size={5} className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Welcome to OrangeFund!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            You'll be able to fund projects using native bitcoin from any Bitcoin wallet.
                          </p>
                          <p className="text-sm text-gray-500">
                            We're getting your account set up. It will take about 10 minutes to hit the blockchain.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <ButtonFundFlow onClick={async () => { registerUserAddress() }} saving={isSaving}>
                        Create Bitcoin account
                      </ButtonFundFlow>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
