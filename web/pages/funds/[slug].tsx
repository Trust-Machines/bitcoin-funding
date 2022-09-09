import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Fund, RegistrationStatus } from '@prisma/client'
import { findFund, findFundFundingTransactions, getBtcPrice, isFundAdmin } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts';
import { ActivityFeedItem } from '@/components/ActivityFeedItem'
import { dollarAmountToString, shortAddress } from '@/common/utils'
import { dateToString, daysToDate } from '@/common/utils'
import { Alert } from '@/components/Alert'
import { Pagination } from '@/components/Pagination'
import { TransactionsPaged } from 'pages/api/Fund/[slug]/transactions'

const FundDetails: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [Fund, setFund] = useState<Fund>({});
  const [transactions, setTransactions] = useState<TransactionsPaged>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [activityFeedItems, setActivityFeedItems] = useState([]);
  const [btcPrice, setBtcPrice] = useState(0);

  const pageSelected = async (page: number) => {
    if (page >= 0 && page < transactions.totalPages) {
      const result = await findFundFundingTransactions(slug as string, page);
      setupActivityItems(Fund, result, btcPrice);
    }
  }

  const setupActivityItems = (FundData: Fund, txData: TransactionsPaged, btcPriceData: number) => {

    let feedItems = [];
    if (txData.currentPage == 0) {
      feedItems.push(
        ActivityFeedItem({
          icon: "CheckCircleIcon", 
          title: "Fund created", 
          subtitle: "",
          details: dateToString(FundData.createdAt)
        })
      )
    }

    for (const tx of txData.transactions) {
      const dollarRaised = (tx.sats / 100000000.00) * btcPriceData;
      feedItems.push(
        ActivityFeedItem({
          icon: "PlusCircleIcon", 
          title: dollarAmountToString(dollarRaised) + " funded", 
          subtitle: "By " + shortAddress(tx.wallet.user.address),
          details: dateToString(tx.createdAt)
        })
      )
    }

    setActivityFeedItems(feedItems);
    setTransactions(txData);
  }

  useEffect(() => {
    const fetchInfo = async (slug: string) => {
      const [
        FundData,
        transactionsData,
        btcPriceData,
        isAdmin
      ] = await Promise.all([
        findFund(slug),
        findFundFundingTransactions(slug, 0),
        getBtcPrice(),
        isFundAdmin(slug, dehydratedState)
      ]);
      setFund(FundData);
      setIsAdmin(isAdmin);
      setBtcPrice(btcPriceData);

      // Setup activity items
      setupActivityItems(FundData, transactionsData, btcPriceData);

      // Start polling if registration not completed yet
      if (Fund.registrationStatus == RegistrationStatus.STARTED) {
        var intervalId = window.setInterval(function(){
          fetchVerifyFund(intervalId);
        }, 15000);
      }

      setIsLoading(false);
    }

    const fetchVerifyFund = async (intervalId: number) => {
      const Fund = await findFund(slug as string);
      // Stop polling if registration completed
      if (Fund.registrationStatus != RegistrationStatus.STARTED) {
        setFund(Fund);
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
                      <img src={`${Fund.avatar}`}/>
                    </div>
                  </section>
                </div>

                {/* COL - NAME */}
                <div className="col-span-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{Fund.name}</h1>
                  {isAdmin ? (
                    <Link
                      href={`/Funds/${Fund.slug}/manage`}
                      className="inline-flex items-center justify-center mt-1 mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                      Manage Fund
                    </Link>
                  ):null}
                  {Fund.registrationStatus == RegistrationStatus.COMPLETED ? (
                    <Link
                      href={`/Funds/${Fund.slug}/fund`}
                      className="inline-flex items-center justify-center mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                      Fund Fund
                    </Link>
                  ):null}
                </div>
              </div> 

              {/* INFO */}
              <section className='mt-6'>
                {Fund.registrationStatus != RegistrationStatus.COMPLETED ? (
                  <div className='mb-4'>
                    <Alert type={Alert.type.WARNING}>
                      The Fund is being registered on chain. Funding will be available once the registration is done.
                    </Alert>
                  </div>
                ):null}

                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      About {Fund.name}
                    </h2>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 mt-5">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Raised so far</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {dollarAmountToString((Fund.totalSats / 100000000.00) * btcPrice)}
                      </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Number of members</dt>
                        <dd className="mt-1 text-sm text-gray-900">{Fund.totalMembers}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Days to go</dt>
                        <dd className="mt-1 text-sm text-gray-900">{daysToDate(Fund.raisingDeadline)}</dd>
                      </div>
                      <div className="sm:col-span-3">
                        <dt className="text-sm font-medium text-gray-500">About</dt>
                        <dd className="mt-1 text-sm text-gray-900">{Fund.about}</dd>
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
                  {transactions.totalPages > 1 ? (
                    <div className='mt-3 pb-3 text-center'>
                      <Pagination 
                        key={transactions.currentPage} 
                        totalPages={transactions.totalPages} 
                        currentPage={transactions.currentPage} 
                        pageSelected={pageSelected}
                      />
                    </div>
                  ):null}
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
export default FundDetails
