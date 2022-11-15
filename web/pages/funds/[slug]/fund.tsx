import type { NextPage } from 'next'
import { ForwardConfirmation, Fund, FundingTransaction, RegistrationStatus, User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAccount, useAuth } from '@micro-stacks/react';
import { getServerSideProps } from '@/common/session/index.ts';
import { findFund, findUser, forwardUserFunds, registerUser, getTransaction, resetForwardUserFunds } from '@/common/fetchers';
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { StyledIcon } from '@/components/StyledIcon'
import { Alert } from '@/components/Alert';
import { AlertWait } from '@/components/AlertWait';
import { bitcoinExplorerLinkAddress, bitcoinExplorerLinkTx, stacksExplorerLinkTx } from '@/common/utils';
import { ButtonFundFlow } from '@/components/ButtonFundFlow';
import { Button } from '@/components/Button'
import { saveFundUserInfo } from '@/common/fetchers'

const stepsInit = [
  { id: '01', name: 'Send BTC to the fund', status: 'current' },
  { id: '02', name: 'Confirmation', status: 'upcoming' },
]

const FundFund: NextPage = ({ dehydratedState }) => {
  const router = useRouter();
  const [state, setState] = useState({
    email: '',
    comment: ''
  });
  const { slug } = router.query;
  const account = useAccount();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fund, setFund] = useState<Fund>({});
  const [user, setUser] = useState<User>({});
  const [forwardConfirmation, setForwardConfirmation] = useState<ForwardConfirmation>({});
  const [transaction, setTransaction] = useState<FundingTransaction>({});
  const [steps, setSteps] = useState(stepsInit);
  const [savedComment, setSavedComment] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push(`/funds/${slug}`);
    } else if (slug) {
      fetchInfo();
    }
  }, [slug, isSignedIn]);

  const fetchInfo = async () => {
    setIsSaving(false);

    const fund = await findFund(slug as string);
    setFund(fund);
    
    const userInfo = await findUser(account.appPrivateKey as string);
    setUser(userInfo);
    const confirmation = userInfo.forwardConfirmation;
    setForwardConfirmation(confirmation)

    // User has not confirmed yet
    let currentStep = 1;
    // if (confirmation.fundAddress == null || (confirmation.fundAddress != null && confirmation.fundAddress != fund.address)) {
    //   currentStep = 0;

    // // User confirmed
    // } else {
    //   currentStep = 1;

    //   // There is a TX ID, so funds have been forwarded
    //   if (confirmation.fundTransactionId) {
    //     const tx = await getTransaction(confirmation.fundTransactionId);
    //     setTransaction(tx);

    //     // Start polling for transaction completion
    //     if (tx.registrationStatus == RegistrationStatus.STARTED) {
    //       var intervalId = window.setInterval(function(){
    //         pollTransaction(intervalId, confirmation.fundTransactionId);
    //       }, 15000);

    //     // Funding is done
    //     } else  {
    //       currentStep = 2;
    //     }

    //   // No TX ID yet, so waiting for funds
    //   } else {

    //     // Start polling the confirmation
    //     var intervalId = window.setInterval(function(){
    //       pollForwardingConfirmation(intervalId);
    //     }, 15000);
    //   }
    // }

    // Update steps data
    var newSteps = [...stepsInit];
    for (let step = 0; step < 2; step++) {
      newSteps[step].status = step < currentStep ? "complete" : step == currentStep ? "current" : "upcoming";
    }
    setSteps(newSteps);

    setIsLoading(false);
  }

  const viewFund = async () => {
    router.push(`/funds/${fund.slug}`);
  }

  const newFunding = async () => {
    setIsSaving(true);
    const result = await resetForwardUserFunds(account.appPrivateKey as string);
    if (result.status === 200) {
      fetchInfo();
    } else {
      setIsSaving(false);
    }
  }

  const forwardFunds = async () => {
    setIsSaving(true);
    const result = await forwardUserFunds(account.appPrivateKey as string, fund.address);
    if (result.status === 200) {
      fetchInfo();
    } else {
      setIsSaving(false);
    }
  }

  const pollForwardingConfirmation = async (intervalId: number) => {
    const userInfo = await findUser(account.appPrivateKey as string);
    if (userInfo.forwardConfirmation.fundTransactionId) {
      clearInterval(intervalId);
      fetchInfo();
    }
  }

  const pollTransaction = async (intervalId: number, txId: string) => {
    const tx = await getTransaction(txId);
    if (tx.registrationStatus != RegistrationStatus.STARTED) {
      clearInterval(intervalId);
      fetchInfo();
    }
    if (transaction.registrationTxId == null && tx.registrationTxId != null) {
      clearInterval(intervalId);
      fetchInfo();
    }
  }

  const handleInputChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    setState(prevState => { return { ...prevState, [name]: target.value } });
  }

  const saveInfo = async () => {
    setIsSaving(true);

    const res = await saveFundUserInfo(fund.slug, state.email, state.comment, dehydratedState);
    const data = await res.json();

    if (res.status === 200) {
      setSavedComment(true);
      setIsSaving(false);
    } else {
      setIsSaving(false);
    }
  }

  return (
    <Container className="min-h-screen">
      {isLoading ? (
        <div className="flex flex-wrap mb-12">
          <Loading />
        </div>
      ) : (
        <main className="py-3 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">

            {/* COL - AVATAR + NAME + INFO */}
            <div className="col-span-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">

                {/* COL - AVATAR  */}
                <div className="col-span-1">
                  <section className="col-span-1 w-40 h-40 lg:w-full lg:h-full lg:w-max-40 lg:h-max-40">
                    <div className="rounded-md overflow-hidden">
                      <img src={`${fund.avatar}`}/>
                    </div>
                  </section>
                </div>

                <div className="col-span-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{fund.name}</h1>
                  <p className="text-sm text-gray-900">{fund.about}</p>
                </div>

              </div>
            </div>
          </div>

          <nav aria-label="Progress" className="mx-auto w-full mt-12">
            <ol role="list" className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className="relative md:flex-1 md:flex">
                  {step.status === 'complete' ? (
                    <a href={step.href} className="group flex items-center w-full">
                      <span className="px-6 py-4 flex items-center text-sm font-medium">
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-orange-600 rounded-full group-hover:bg-orange-800">
                          <StyledIcon
                            as="CheckIcon"
                            size={6}
                            solid={false}
                            className="text-white"
                          />
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                      </span>
                    </a>
                  ) : step.status === 'current' ? (
                    <a href={step.href} className="px-6 py-4 flex items-center text-sm font-medium" aria-current="step">
                      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-orange-600 rounded-full">
                        <span className="text-orange-600">{step.id}</span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-orange-600">{step.name}</span>
                    </a>
                  ) : (
                    <a href={step.href} className="group flex items-center">
                      <span className="px-6 py-4 flex items-center text-sm font-medium">
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                          <span className="text-gray-500 group-hover:text-gray-900">{step.id}</span>
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</span>
                      </span>
                    </a>
                  )}

                  {stepIdx !== steps.length - 1 ? (
                    <>
                      {/* Arrow separator for lg screens and up */}
                      <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                        <svg
                          className="h-full w-full text-gray-300"
                          viewBox="0 0 22 80"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 -2L20 40L0 82"
                            vectorEffect="non-scaling-stroke"
                            stroke="currentcolor"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
          <section className="mt-8">
            {steps[0].status == "current" ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                    Send BTC to 
                    <span className="font-bold"> {user.fundingWalletAddress}</span> or use the QR code below
                  </p>
                  <p>
                    <img src={`https://chart.googleapis.com/chart?chs=225x225&chld=L|2&cht=qr&chl=bitcoin:${user.fundingWalletAddress}`} />
                  </p>
                  <p className="mt-3">
                    Once you have sent the funds, confirm below. We will track your funding and register it on chain.
                  </p>

                  {forwardConfirmation && forwardConfirmation.fundAddress != null && forwardConfirmation.fundAddress != fund.address && forwardConfirmation.fundTransactionId == null ? (
                    <div className="mt-3">
                      <Alert type={Alert.type.ERROR} title="Attention required">
                        You have previously confirmed to forward BTC to another fund but no BTC was received yet after your confirmation.
                        If you still want to fund the other fund, please wait for your first transaction to complete.
                        If you do not want to fund the other fund, you can continue.
                      </Alert>
                    </div>
                  ): null}

                </div>
                <div>
                  <ButtonFundFlow onClick={async () => { forwardFunds() }} saving={isSaving}>
                    Confirm funding
                  </ButtonFundFlow>
                </div>
              </div>

            ): steps[1].status == "current" ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                    The fund is being funded with your BTC. 
                    No further action is required.
                  </p>
                  <div className="mt-3">
                    {forwardConfirmation && forwardConfirmation.fundTransactionId == null ? (
                      <AlertWait 
                        title="Waiting for your BTC to arrive..."
                        subTitle="Bitcoin transactions can take 10-30 minutes to complete."
                        linkText="Show wallet in explorer"
                        link={bitcoinExplorerLinkAddress(user.fundingWalletAddress)}
                      />
                    ) : transaction.registrationTxId ? (
                      <AlertWait 
                        title="Your BTC has arrived at the fund's wallet. It's now being registered on chain."
                        subTitle="Stacks transactions can take 10-30 minutes to complete."
                        linkText="Show transaction in explorer"
                        link={stacksExplorerLinkTx(transaction.registrationTxId)}
                      />
                    ) : (
                      <AlertWait 
                        title="Waiting for your BTC to arrive at the fund's wallet"
                        subTitle="Bitcoin transactions can take 10-30 minutes to complete."
                        linkText="Show transaction in explorer"
                        link={bitcoinExplorerLinkTx(transaction.txId)}
                      />
                    )}
                  </div>

                  {savedComment ? (
                    <div className="mt-3">
                      
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <StyledIcon as="CheckCircleIcon" size={5} className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">Your data was saved succesfully and you will receive periodical updates from the project.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      Leave your email and a comment below to stay updated on {fund.name}'s progress.

                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Your email</label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="max-w-lg flex rounded-md shadow-sm">
                            <input
                              type="text"
                              name="email"
                              id="email"
                              autoComplete="email"
                              className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                              onChange={handleInputChange}
                              value={state.email}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Comment (optional)</label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="max-w-lg flex rounded-md shadow-sm">
                            <textarea
                              id="comment"
                              name="comment"
                              rows="3"
                              className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                              onChange={handleInputChange}
                              value={state.comment}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:items-end sm:pt-5">
                        <div className="flex justify-end">
                          <Button onClick={() => saveInfo()} saving={isSaving}>
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ):(
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                    You have succesfully funded {' '}
                    {(transaction.sats / 100000000.0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })} BTC!
                  </p>
                  <a
                    onClick={() => { newFunding() }}
                    className="text-orange-700 cursor-pointer"
                  >
                    Fund again
                  </a>
                </div>
                <div>
                  <a
                    onClick={() => { viewFund() }}
                    className="block bg-orange-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-orange-700 sm:rounded-b-lg cursor-pointer"
                  >
                    View fund
                  </a>
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </Container>
  )
};

export { getServerSideProps };
export default FundFund
