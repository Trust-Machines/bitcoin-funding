import type { NextPage } from 'next'
import { Dao, FundingTransaction, RegistrationStatus, User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAccount, useAuth } from '@micro-stacks/react';
import { getServerSideProps } from '@/common/session/index.ts';
import { findDao, findUser, getUserBalance, forwardUserFunds, registerUser, getTransaction } from '@/common/fetchers';
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { StyledIcon } from '@/components/StyledIcon'
import { Alert } from '@/components/Alert';

const steps = [
  { id: '01', name: 'Connect Hiro Wallet', status: 'complete' },
  { id: '02', name: 'Register BTC address', status: 'complete' },
  { id: '03', name: 'Send BTC to DAO', status: 'current' },
  { id: '04', name: 'Confirm', status: 'upcoming' },
]

const FundDao: NextPage = ({ dehydratedState }) => {
  const router = useRouter();
  const { slug } = router.query;
  const account = useAccount();
  const { openAuthRequest, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});
  const [user, setUser] = useState<User>({});
  const [transaction, setTransaction] = useState<FundingTransaction>({});
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchInfo();
    }
  }, [slug, isSignedIn]);

  const fetchInfo = async () => {
    const dao = await findDao(slug as string);
    setDao(dao);
    
    let currentStep = 0;
    if (isSignedIn) {
      const user = await findUser(account.appPrivateKey as string);
      setUser(user);

      // User signed in and completed registration
      if (user.registrationStatus == RegistrationStatus.COMPLETED) {
        const txId = localStorage.getItem('fund-tx');

        // If forwarding transaction yet
        if (txId == undefined) {
          currentStep = 2;
          const balanceResult = await getUserBalance(account.appPrivateKey as string);
          if (balanceResult.status === 200) {
            // If status is not 200, something went wrong. Most likely app is down or Electrum server is not reachable
            const userBalance = await balanceResult.json();
            setWalletBalance(userBalance);

            // Start polling for balance
            if (userBalance == 0) {
              var intervalId = window.setInterval(function(){
                pollUserBalance(intervalId);
              }, 15000);
            }
          }
        // User has unverified transactions
        } else {          
          const tx = await getTransaction(txId);
          setTransaction(tx);

          // Start polling for transaction completion
          if (tx.registrationStatus == RegistrationStatus.STARTED) {
            currentStep = 3;
            var intervalId = window.setInterval(function(){
              pollTransaction(intervalId);
            }, 15000);
          } else  {
            currentStep = 4;
          }
        }

      // User signed in and started registration
      } else {
        currentStep = 1;

        // Start polling if registration started
        if (user.registrationTxId != null) {
          var intervalId = window.setInterval(function(){
            pollUser(intervalId);
          }, 15000);  
        }
      }
    }

    // Update steps data
    for (let step = 0; step < 4; step++) {
      steps[step].status = step < currentStep ? "complete" : step == currentStep ? "current" : "upcoming";
    }

    setIsLoading(false);
  }

  const connectWallet = async () => {
    await openAuthRequest();
    fetchInfo();
  }

  const registerUserAddress = async () => {
    const result = await registerUser(account.appPrivateKey as string);
    if (result.status === 200) {
      fetchInfo();
    }
  }

  const newFunding = async () => {
    localStorage.removeItem('fund-tx');
    fetchInfo();
  }

  const viewDao = async () => {
    router.push(`/daos/${dao.slug}`);
  }

  const forwardFunds = async () => {
    // TODO: forward actual walletBalance
    // const result = await forwardUserFunds(account.appPrivateKey as string, walletBalance, dao.address);
    const result = await forwardUserFunds(account.appPrivateKey as string, 10000000, dao.address);
    if (result.status === 200) {
      const json = await result.json();
      localStorage.setItem('fund-tx', json.txId);
      fetchInfo();
    }
  }

  const pollUserBalance = async (intervalId: number) => {
    const balanceResult = await getUserBalance(account.appPrivateKey as string);
    if (balanceResult.status != 200) {
      return;
    }

    const balance = await balanceResult.json();
    if (balance > 0) {
      clearInterval(intervalId);
      fetchInfo();
    }
  }

  const pollUser = async (intervalId: number) => {
    const user = await findUser(account.appPrivateKey as string);
    if (user.registrationStatus != RegistrationStatus.STARTED) {
      clearInterval(intervalId);
      fetchInfo();
    }
  }

  const pollTransaction = async (intervalId: number) => {
    const txId = localStorage.getItem('fund-tx');
    const tx = await getTransaction(txId as string);
    if (tx.registrationStatus != RegistrationStatus.STARTED) {
      clearInterval(intervalId);
      fetchInfo();
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
                      <img src={`${dao.avatar}`}/>
                    </div>
                  </section>
                </div>

                <div className="col-span-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{dao.name}</h1>
                  <p className="text-sm text-gray-900">{dao.about}</p>
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
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full group-hover:bg-blue-800">
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
                      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-blue-600 rounded-full">
                        <span className="text-blue-600">{step.id}</span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-blue-600">{step.name}</span>
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
                    Connect your Stacks wallet.
                  </p>
                  <p>
                    No wallet installed yet? Download the Hiro wallet 
                    <a 
                      className="ml-1 text-blue-700"
                      target="_blank"
                      href="https://wallet.hiro.so/"
                    > 
                      here
                    </a>.
                  </p>
                </div>
                <div>
                  <a
                    onClick={async () => { connectWallet() }}
                    className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                  >
                    Connect Stacks wallet
                  </a>
                </div>
              </div>
            ) : steps[1].status == "current" ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                    It seems like this is your first time funding on BallotBox. 
                    We will create an internal BTC account for you and register this on-chain. 
                    Don't worry, gas is on us!
                  </p>
                  {user.registrationStatus == RegistrationStatus.FAILED ? (
                    <div className="mt-3">
                      <Alert type={Alert.type.ERROR}>
                        The registration failed. Please try again.
                      </Alert>
                    </div>
                  ):null}
                </div>
                <div>
                  {user.registrationStatus == RegistrationStatus.STARTED ? (
                    <div
                      className="block bg-orange-600 text-sm font-medium text-white text-center px-4 py-4 sm:rounded-b-lg"
                    >
                      Your BTC account is being created. This can take up to 30 minutes.
                    </div>
                  ):(
                    <a
                      onClick={() => { registerUserAddress() }}
                      href="#"
                      className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                    >
                      Create BTC account
                    </a>
                  )}
                </div>
              </div>

            ): steps[2].status == "current" ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>Send BTC to 
                    <span className="font-bold"> {user.fundingWalletAddress}</span>
                  </p>
                  <p>Once you've sent the funds, we keep track of the transaction and allow you to confirm and fund the DAO.</p>
                </div>
                <div>
                  {walletBalance == 0 ? (
                    <div
                      className="block bg-orange-600 text-sm font-medium text-white text-center px-4 py-4 sm:rounded-b-lg"
                    >
                      Waiting for your BTC to arrive...
                    </div>
                  ):(
                    <a
                      onClick={() => { forwardFunds() }}
                      className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                    >
                      Fund {' '}
                      {(walletBalance / 100000000.0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })} BTC
                    </a>
                  )}
                </div>
              </div>

            ): steps[3].status == "current" ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                  The DAO is being funded with your BTC. 
                  It takes 10-20 minutes for the funding to be registered on chain. 
                  No further action is required.
                  </p>
                </div>
                <div>
                <div
                  className="block bg-orange-600 text-sm font-medium text-white text-center px-4 py-4 sm:rounded-b-lg"
                >
                  Waiting for your transaction registration..
                </div>
                </div>
              </div>
            ): (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p>
                    You have succesfully funded the DAO with {' '}
                    {(transaction.sats / 100000000.0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })} BTC!
                  </p>
                  <a
                    onClick={() => { newFunding() }}
                    className="text-blue-700"
                  >
                    Fund again
                  </a>
                </div>
                <div>
                  <a
                    onClick={() => { viewDao() }}
                    className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                  >
                    View DAO
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
export default FundDao
