import type { NextPage } from 'next'
import Link from 'next/link'

import { Dao, User } from '@prisma/client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAccount } from '@micro-stacks/react';

import { findDao, findUser } from '@/common/fetchers';
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'

import { StyledIcon } from '@/components/StyledIcon'

const steps = [
  { id: '01', name: 'Connect Hiro Wallet', href: '#', status: 'complete' },
  { id: '02', name: 'Register BTC address', href: '#', status: 'complete' },
  { id: '03', name: 'Send BTC to DAO', href: '#', status: 'current' },
  { id: '04', name: 'Confirm', href: '#', status: 'upcoming' },
]

const FundDao: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});
  const [user, setUser] = useState<User>({});
  const [userHasWallet, setUserHasWallet] = useState(false);

  useEffect(() => {
    const fetchDao = async () => {
      setDao(await findDao(slug));
    };

    const fetchUser = async () => {
      const user = await findUser(account['appPrivateKey']);
      setUser(user);
      if (!user || !user['fundingWalletPublicKey']) {
        console.log('TODO: redirect to a route to register BTC address on-chain');
      }
      setIsLoading(false);
    }

    if (slug) {
      fetchDao();
      fetchUser();
    }
  }, [slug]);

  return (
    <Container className="min-h-screen">
      {isLoading ? (
        <div className="flex flex-wrap mb-12">
          <Loading />
        </div>
      ) : (
        <main className="py-10">
          {/* Page header */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
            <div className="flex items-center space-x-5">
              <div>
                <Link href={`/daos/${dao.slug}`}>
                  <h1 className="text-2xl font-bold text-gray-900">{dao.name}</h1>
                </Link>
                <p className="text-sm font-medium text-gray-500">
                  {dao.about}                  
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8 mt-4">
            <img
              className="w-full max-h-60"
              src="https://as1.ftcdn.net/v2/jpg/03/32/69/82/1000_F_332698203_XmQ4jYo8vDPfgeqZ3Ake9xfRMS7ChD15.jpg"
            />
          </div>

          <nav aria-label="Progress" className="mx-auto w-full px-4 sm:px-6 mt-12">
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

          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2">
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      Fund {dao.name}
                    </h2>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <p>Send BTC to {user.fundingWalletPublicKey}</p>

                    <p>Once you've sent it, we keep track of the transaction and allow you to confirm the funds.</p>
                  </div>
                  <div>
                    <a
                      href="#"
                      className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                    >
                      Fund DAO
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      )}
    </Container>
  )
};

export default FundDao
