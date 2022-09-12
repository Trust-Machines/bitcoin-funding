import { useEffect, useState } from 'react'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { FundThumbnail } from '@/components/FundThumbnail'
import { findAllFunds, findUserFunds } from '@/common/fetchers'
import { Pagination } from './Pagination'
import { FundsPaged } from 'pages/api/fund/all'
import { Fund } from '@prisma/client'

export function Main({ dehydratedState }) {
  const [isLoading, setIsLoading] = useState(true);
  const [funds, setFunds] = useState<FundsPaged>({});
  const [userFunds, setUserFunds] = useState<Fund[]>({});

  const pageSelected = (page: Number) => {
    if (page >= 0 && page < funds.totalPages) {
      fetchFunds(page);
    }
  }

  const fetchFunds = async (page: Number) => {
    setIsLoading(true);
    setFunds(await findAllFunds(page));
    setUserFunds(await findUserFunds(dehydratedState));
    setIsLoading(false);
  }

  useEffect(() => {
    if (isLoading) {
      fetchFunds(0);
    }
  }, []);

  return (
    <Container className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pb-8 sm:px-6 lg:max-w-7xl lg:px-8">

        {isLoading ? (
          <Loading />
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your Funds</h2>
            {userFunds.length > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {userFunds.map(fund => <FundThumbnail key={"user" + fund.address} fund={fund} />)}
                </div>
              </>
            ) : (
              <span>You have no funds yet</span>
            )}

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-8">Our popular Funds</h2>
            {funds.total > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {funds.funds.map(fund => <FundThumbnail key={fund.address} fund={fund} />)}
                </div>
                {funds.totalPages > 1 ? (
                  <div className='mt-8 text-center'>
                    <Pagination 
                      key={funds.currentPage} 
                      totalPages={funds.totalPages} 
                      currentPage={funds.currentPage} 
                      pageSelected={pageSelected}
                    />
                  </div>
                ):null}
              </>
            ) : (
              <span>No funds yet...</span>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
