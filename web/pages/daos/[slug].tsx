import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Dao, RegistrationStatus } from '@prisma/client'
import { findDao, verifyDao, findDaoFundingTransactions, getBtcPrice } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts';
import { ActivityFeedItem } from '@/components/ActivityFeedItem'
import { dollarAmountToString } from '@/common/utils'
import { stacksApiUrl } from '@/common/constants'
import { dateToString, daysToDate } from '@/common/utils'

const DaoDetails: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [activityFeedItems, setActivityFeedItems] = useState([{}]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);

  useEffect(() => {
    const fetchInfo = async (slug: string) => {
      const [
        dao,
        transactions,
        btcPrice
      ] = await Promise.all([
        findDao(slug),
        findDaoFundingTransactions(slug),
        getBtcPrice()
      ]);
      setDao(dao);

      const parsedState = JSON.parse(dehydratedState) || []
      if (dao.admins && dao.admins.length > 0 && parsedState.length > 0) {
        const account = parsedState[1][1][0];
        setIsAdmin(dao.admins.findIndex(i => i['userId'] === account['appPrivateKey']) !== -1);
      }

      // Get totals
      let members: string[] = [];
      let raised = 0;
      let feedItems = [];
      for (const tx of transactions) {
        if (!members.includes(tx.wallet)) {
          members.push(tx.walletAddress);
        }
        const dollarRaised = (tx.sats / 100000000.00) * btcPrice;
        raised += dollarRaised;

        feedItems.push(
          ActivityFeedItem({
            icon: "ExclamationCircleIcon", 
            title: dollarAmountToString(dollarRaised) + " funded", 
            details: dateToString(tx.createdAt)
          })
        )
      }

      // TODO: this won't work once the API is paginated
      setTotalMembers(members.length);
      setTotalRaised(raised);
      setActivityFeedItems(feedItems);

      // Start polling if registration not completed yet
      if (dao.registrationStatus == RegistrationStatus.STARTED) {
        var intervalId = window.setInterval(function(){
          fetchVerifyDao(intervalId);
        }, 15000);
        fetchVerifyDao(intervalId);
      }

      setIsLoading(false);
    }

    const fetchVerifyDao = async (intervalId: number) => {
      const dao = await verifyDao(slug as string);

      // Stop polling if registration completed
      if (dao.registrationStatus != RegistrationStatus.STARTED) {
        setDao(dao);
        clearInterval(intervalId);
      }
    }

    if (slug) {
      fetchInfo(slug as string);
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
            {isAdmin ? (
              <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                <Link
                  href={`/daos/${dao.slug}/manage`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                >
                  Manage DAO
                </Link>
              </div>
            ) : null}
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
                        <dd className="mt-1 text-sm text-gray-900">
                          {dollarAmountToString(totalRaised)}
                      </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Number of members</dt>
                        <dd className="mt-1 text-sm text-gray-900">{totalMembers}</dd>
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
                    {activityFeedItems}
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

export { getServerSideProps };
export default DaoDetails
