import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Dao, RegistrationStatus } from '@prisma/client'
import { findAndVerifyDao } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { StyledIcon } from '@/components/StyledIcon'
import { stacksApiUrl } from '@/common/constants'
import { dateToString, daysToDate } from '@/common/utils'

const DaoDetails: NextPage = () => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});

  useEffect(() => {

    const fetchVerifyDao = async (intervalId: number) => {
      const dao = await findAndVerifyDao(slug as string);

      // Stop polling if registration completed
      if (dao.registrationStatus != RegistrationStatus.STARTED) {
        setDao(dao);
        clearInterval(intervalId);
      }
    }

    const fetchDao = async () => {
      const dao = await findAndVerifyDao(slug as string);

      // Start polling if registration not completed yet
      if (dao.registrationStatus == RegistrationStatus.STARTED) {
        var intervalId = window.setInterval(function(){
          fetchVerifyDao(intervalId);
        }, 15000);
      }

      setDao(dao);
      setIsLoading(false);
    };

    if (slug) {
      fetchDao();
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
                <h1 className="text-2xl font-bold text-gray-900">{dao.name}</h1>
                <p className="text-sm font-medium text-gray-500">
                  {dao.about}                  
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
              >
                Manage DAO
              </button>
            </div>
          </div>

          <div className="mx-auto w-full px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8 mt-4">
            <img
              className="w-full max-h-60"
              src="https://as1.ftcdn.net/v2/jpg/03/32/69/82/1000_F_332698203_XmQ4jYo8vDPfgeqZ3Ake9xfRMS7ChD15.jpg"
            />
          </div>

          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2">
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      About {dao.name}
                    </h2>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Raised so far</dt>
                        <dd className="mt-1 text-sm text-gray-900">$80,000</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Number of members</dt>
                        <dd className="mt-1 text-sm text-gray-900">84</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Days to go</dt>
                        <dd className="mt-1 text-sm text-gray-900">{daysToDate(dao.raisingDeadline)}</dd>
                      </div>
                      <div className="sm:col-span-3">
                        <dt className="text-sm font-medium text-gray-500">Our Story</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {dao.about}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    {dao.registrationStatus == RegistrationStatus.COMPLETED ? (
                      <a
                        href="#"
                        className="block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                      >
                        Fund DAO
                      </a>
                    ):(
                      <a
                        href={stacksApiUrl + "/extended/v1/tx/" + dao.registrationTxId}
                        target="_blank"
                        className="block bg-orange-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-orange-700 sm:rounded-b-lg"
                      >
                        The DAO is being registered on chain. Funding will be available once the registration is done.
                      </a>
                    )}
                  </div>

                </div>
              </section>
            </div>

            <section aria-labelledby="timeline-title" className="lg:col-start-3 lg:col-span-1">
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                  Timeline
                </h2>

                {/* Activity Feed */}
                <div className="mt-6 flow-root">
                  <ul role="list" className="-mb-8">
                    <li key='1'>
                      <div className="relative pb-8">
                        {false ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3 mb-4">
                          <div>
                            <span className='bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'>
                              <StyledIcon
                                as="PlusCircleIcon"
                                size={6}
                                solid={false}
                                className="text-white"
                              />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                DAO created
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime='2022-01-08'>{dateToString(dao.createdAt)}</time>
                            </div>
                          </div>
                        </div>

                        <div className="relative flex space-x-3">
                          <div>
                            <span className='bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'>
                              <StyledIcon
                                as="ExclamationCircleIcon"
                                size={6}
                                solid={false}
                                className="text-white"
                              />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                SP123.... funded the DAO
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime='2022-01-08'>Aug, 2022</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {dao.registrationStatus == RegistrationStatus.COMPLETED ? (
                  <div className="mt-6 flex flex-col justify-stretch">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Fund DAO
                    </button>
                  </div>
                ):null}
                
              </div>
            </section>
          </div>
        </main>
      )}
    </Container>
  )
};

export default DaoDetails
