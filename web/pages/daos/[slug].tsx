import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Dao, RegistrationStatus } from '@prisma/client'
import { findDao, findDaoFundingTransactions, getBtcPrice, isDaoAdmin } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts';
import { ActivityFeedItem } from '@/components/ActivityFeedItem'
import { dollarAmountToString, shortAddress } from '@/common/utils'
import { stacksApiUrl } from '@/common/constants'
import { dateToString, daysToDate } from '@/common/utils'
import { Alert } from '@/components/Alert'

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
        btcPrice,
        isAdmin
      ] = await Promise.all([
        findDao(slug),
        findDaoFundingTransactions(slug),
        getBtcPrice(),
        isDaoAdmin(slug, dehydratedState)
      ]);
      setDao(dao);
      setIsAdmin(isAdmin);

      // Get totals
      let members: string[] = [];
      let raised = 0;
      let feedItems = [];

      feedItems.push(
        ActivityFeedItem({
          icon: "CheckCircleIcon", 
          title: "DAO created", 
          subtitle: "",
          details: dateToString(dao.createdAt)
        })
      )

      for (const tx of transactions) {
        if (!members.includes(tx.wallet)) {
          members.push(tx.walletAddress);
        }
        const dollarRaised = (tx.sats / 100000000.00) * btcPrice;
        raised += dollarRaised;
        feedItems.push(
          ActivityFeedItem({
            icon: "PlusCircleIcon", 
            title: dollarAmountToString(dollarRaised) + " funded", 
            subtitle: "By " + shortAddress(tx.wallet.user.address),
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
      }

      setIsLoading(false);
    }

    const fetchVerifyDao = async (intervalId: number) => {
      const dao = await findDao(slug as string);
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

                {/* COL - NAME */}
                <div className="col-span-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{dao.name}</h1>
                  {isAdmin ? (
                    <Link
                      href={`/daos/${dao.slug}/manage`}
                      className="inline-flex items-center justify-center mt-1 mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                      Manage DAO
                    </Link>
                  ):null}
                  {dao.registrationStatus == RegistrationStatus.COMPLETED ? (
                    <Link
                      href={`/daos/${dao.slug}/fund`}
                      className="inline-flex items-center justify-center mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                      Fund DAO
                    </Link>
                  ):null}
                </div>
              </div> 

              {/* INFO */}
              <section className='mt-6'>
                {dao.registrationStatus != RegistrationStatus.COMPLETED ? (
                  <div className='mb-4'>
                    <Alert type={Alert.type.WARNING}>
                      The DAO is being registered on chain. Funding will be available once the registration is done.
                    </Alert>
                  </div>
                ):null}

                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      About {dao.name}
                    </h2>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 mt-5">
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
                        <dt className="text-sm font-medium text-gray-500">About</dt>
                        <dd className="mt-1 text-sm text-gray-900">{dao.about}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            </div>

            {/* COL - Activity feed */}
            <div className="col-span-2">
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 id="activity" className="text-lg leading-6 font-medium text-gray-900">
                      Activity feed
                    </h2>
                  </div>
                  <div className="px-4 sm:px-6 pt-4">
                    <ul role="list" className="">
                      {activityFeedItems}
                    </ul>
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

export { getServerSideProps };
export default DaoDetails
