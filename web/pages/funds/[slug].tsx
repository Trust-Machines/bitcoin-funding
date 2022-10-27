import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Fund, RegistrationStatus } from '@prisma/client'
import { findFund, findFundFundingTransactions, findFundMembers, findUser, getBtcPrice, isFundAdmin } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts';
import { ActivityFeedItem } from '@/components/ActivityFeedItem'
import { dollarAmountToString, shortAddress, stacksExplorerLinkTx, resolveBns } from '@/common/utils'
import { dateToString, daysToDate } from '@/common/utils'
import { Pagination } from '@/components/Pagination'
import { TransactionsPaged } from 'pages/api/fund/[slug]/transactions'
import { AlertWait } from '@/components/AlertWait'
import { MembersPaged } from 'pages/api/fund/[slug]/members'
import { StyledIcon } from '@/components/StyledIcon';
import { useAccount, useAuth } from '@micro-stacks/react'

const FundDetails: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const account = useAccount();
  const { isSignedIn } = useAuth();
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [fund, setFund] = useState<Fund>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<TransactionsPaged>({});
  const [activityFeedItems, setActivityFeedItems] = useState([]);
  const [members, setMembers] = useState<MembersPaged>({});
  const [memberItems, setMemberItems] = useState([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const [user, setUser] = useState<User>({});

  const pageSelectedTransactions = async (page: number) => {
    if (page >= 0 && page < transactions.totalPages) {
      const result = await findFundFundingTransactions(slug as string, page);
      setupActivityItems(fund, result, btcPrice);
    }
  }

  const pageSelectedMembers = async (page: number) => {
    if (page >= 0 && page < members.totalPages) {
      const result = await findFundMembers(slug as string, page);
      setupMemberItems(fund, result, btcPrice);
    }
  }

  const setupActivityItems = async (fundData: Fund, txData: TransactionsPaged, btcPriceData: number) => {
    let feedItems = [];
    for (const tx of txData.transactions) {
      const btcRaised = tx.sats / 100000000.0;
      const name = await resolveBns(tx.userAddress);

      feedItems.push(
        ActivityFeedItem({
          icon: "PlusCircleIcon",
          title: name,
          subtitle: dateToString(tx.createdAt),
          titleRight: btcRaised + " BTC",
          subtitleRight: dollarAmountToString(btcRaised * btcPriceData)
        })
      )
    }

    if (txData.total == 0 || txData.currentPage == txData.totalPages - 1) {
      feedItems.push(
        ActivityFeedItem({
          icon: "CheckCircleIcon", 
          title: "Fund created", 
          subtitle: dateToString(fundData.createdAt),
          titleRight: "",
          subtitleRight: ""
        })
      )
    }

    setActivityFeedItems(feedItems);
    setTransactions(txData);
  }

  const setupMemberItems = (fundData: Fund, membersData: MembersPaged, btcPriceData: number) => {
    let feedItems = [];
    for (const member of membersData.members) {
      const btcRaised = member.sats / 100000000.0;
      feedItems.push(
        ActivityFeedItem({
          icon: "UserCircleIcon", 
          title: shortAddress(member.userAddress), 
          subtitle: dateToString(member.updatedAt),
          titleRight: btcRaised + " BTC",
          subtitleRight: dollarAmountToString(btcRaised * btcPriceData)
        })
      )
    }

    if (membersData.total == 0) {
      feedItems.push(
        ActivityFeedItem({
          icon: "XCircleIcon", 
          title: "No members yet..", 
          subtitle: "",
          titleRight: "...",
          subtitleRight: ""
        })
      )
    }

    setMemberItems(feedItems);
    setMembers(membersData);
  }

  useEffect(() => {
    const fetchInfo = async (slug: string) => {
      const [
        fundData,
        transactionsData,
        members,
        btcPriceData,
      ] = await Promise.all([
        findFund(slug),
        findFundFundingTransactions(slug, 0),
        findFundMembers(slug, 0),
        getBtcPrice(),
      ]);
      setFund(fundData);
      setBtcPrice(btcPriceData);

      if (isSignedIn) {
        const userInfo = await findUser(account.appPrivateKey as string);
        setUser(userInfo);
      }

      // Setup activity items
      setupActivityItems(fundData, transactionsData, btcPriceData);
      setupMemberItems(fundData, members, btcPriceData);

      // Start polling if registration not completed yet
      if (fundData.registrationStatus == RegistrationStatus.STARTED) {
        var intervalId = window.setInterval(function(){
          fetchVerifyFund(intervalId);
        }, 15000);
      }

      setIsLoading(false);

      const isAdmin = await isFundAdmin(slug, dehydratedState);
      setIsAdmin(isAdmin);
    }

    const fetchVerifyFund = async (intervalId: number) => {
      const fund = await findFund(slug as string);
      // Stop polling if registration completed
      if (fund.registrationStatus != RegistrationStatus.STARTED) {
        setFund(fund);
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
                      <img src={fund.avatar}/>
                    </div>
                  </section>
                </div>

                {/* COL - NAME */}
                <div className="col-span-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{fund.name}</h1>
                  <div className="inline-flex items-center justify-center">
                    {isAdmin ? (
                      <Link
                        href={`/funds/${fund.slug}/manage`}
                        className="inline-flex items-center justify-center mt-1 mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-orange-500"
                      >
                        Manage
                      </Link>
                    ):null}

                    {!isSignedIn ? (
                      <div className="has-tooltip">
                        <span className="tooltip rounded shadow-lg p-2 bg-black text-white -mt-8 font-semibold">
                          Connect your Stacks wallet first... 
                        </span>
                        <button
                          className="inline-flex items-center justify-center disabled:opacity-75 mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 focus:outline-none cursor-not-allowed"
                          disabled
                        >
                          Fund
                        </button>
                      </div>
                    ) : user.registrationStatus == RegistrationStatus.COMPLETED ? (
                      <Link
                        href={`/funds/${fund.slug}/fund`}
                        className="inline-flex items-center justify-center mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-orange-500"
                      >
                        Fund
                      </Link>
                    ): (
                      <div className="has-tooltip">
                        <span className="tooltip rounded shadow-lg p-2 bg-black text-white -mt-8 font-semibold">
                          Your BTC address is being registered on-chain...
                        </span>
                        <button
                          className="inline-flex items-center justify-center disabled:opacity-75 mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 focus:outline-none cursor-not-allowed"
                          disabled
                        >
                          Fund
                        </button>
                      </div>
                    )}

                    {fund.twitterHandle ? (
                      <Link
                        className="inline-flex items-center justify-center mr-4 ml-8"
                        target="_blank" href={`https://www.twitter.com/${fund.twitterHandle}`}
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24">
                          <path
                            d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                          />
                        </svg>
                      </Link>
                    ) : null}
                    {fund.websiteUrl ? (
                      <Link className="inline-flex items-center justify-center mr-4 ml-2 text-gray-500" target="_blank" href={`https://${fund.websiteUrl}`}>
                        <StyledIcon as="LinkIcon" size={5} className="block" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div> 

              {/* INFO */}
              <section className='mt-6'>
                {fund.registrationStatus != RegistrationStatus.COMPLETED ? (
                  <div className='mb-4'>
                    <AlertWait 
                      title="The Fund is being registered on chain. Funding will be available once the registration is done."
                      subTitle="Stacks transactions can take 10-30 minutes to complete."
                      linkText="Open transaction in explorer"
                      link={stacksExplorerLinkTx(fund.registrationTxId)}
                    />
                  </div>
                ):null}

                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      About {fund.name}
                    </h2>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-5">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Raised so far</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {(fund.totalSats / 100000000.00).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })} BTC
                          {' '}
                          <span className="text-xs text-gray-600">
                            ({dollarAmountToString((fund.totalSats / 100000000.00) * btcPrice)})
                          </span>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Target to raise</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {(fund.raisingAmount / 100000000.00).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })} BTC
                          {' '}
                          <span className="text-xs text-gray-600">
                            ({dollarAmountToString((fund.raisingAmount / 100000000.00) * btcPrice)})
                          </span>
                        </dd>
                      </div>
                    </dl>
                    <dl className="grid grid-cols-1 gap-y-4 mt-5 mb-12">
                      <div className="sm:col-span-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${100 * fund.totalSats / fund.raisingAmount}%`}}></div>
                        </div>
                      </div>
                    </dl>

                    <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-5">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Number of members</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {fund.totalMembers}
                          {' '}
                          <span className="text-xs text-gray-600">
                            ({transactions.total} transactions)
                          </span>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Days to go</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {daysToDate(fund.raisingDeadline)}
                          {' '}
                          <span className="text-xs text-gray-600">
                            ({dateToString(fund.raisingDeadline, false)})
                          </span>
                        </dd>
                      </div>
                      <div className="sm:col-span-3">
                        <dt className="text-sm font-medium text-gray-500">About</dt>
                        <dd className="mt-1 text-sm text-gray-900">{fund.about}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            </div>

            {/* COL - Activity feed & members */}
            <div className="col-span-2">
              <section>
                {showMembers ? (
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                        <li className="mr-2">
                          <button onClick={() => setShowMembers(false)} className="inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                            Activity
                          </button>
                        </li>
                        <li className="mr-2">
                          <button onClick={() => setShowMembers(true)}  className="inline-flex p-4 text-orange-600 rounded-t-lg border-b-2 border-orange-600 active dark:text-orange-500 dark:border-orange-500 group" aria-current="page">
                            Members
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="px-4 sm:px-6 pt-4">
                      <ul role="list" className="">
                        {memberItems}
                      </ul>
                    </div>
                    {members.totalPages > 1 ? (
                      <div className='mt-3 pb-3 text-center'>
                        <Pagination 
                          key={members.currentPage} 
                          totalPages={members.totalPages} 
                          currentPage={members.currentPage} 
                          pageSelected={pageSelectedMembers}
                        />
                      </div>
                    ):null}
                  </div>
                ):(
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                        <li className="mr-2">
                          <button onClick={() => setShowMembers(false)}  className="inline-flex p-4 text-orange-600 rounded-t-lg border-b-2 border-orange-600 active dark:text-orange-500 dark:border-orange-500 group" aria-current="page">
                            Activity
                          </button>
                        </li>
                        <li className="mr-2">
                          <button onClick={() => setShowMembers(true)} className="inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group">
                            Members
                          </button>
                        </li>
                      </ul>
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
                          pageSelected={pageSelectedTransactions}
                        />
                      </div>
                    ):null}
                  </div>
                )}
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
