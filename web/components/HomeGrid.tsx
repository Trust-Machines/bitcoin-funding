import { useEffect, useState } from 'react'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { fundThumbnail } from '@/components/fundThumbnail'
import { findAllfunds } from '@/common/fetchers'
import { fundsPaged } from 'pages/api/fund/all'
import { Pagination } from './Pagination'

export function HomeGrid() {

  const [isLoading, setIsLoading] = useState(true);
  const [funds, setfunds] = useState<fundsPaged>({});

  const pageSelected = (page: Number) => {
    if (page >= 0 && page < funds.totalPages) {
      fetchfunds(page);
    }
  }

  const fetchfunds = async (page: Number) => {
    setIsLoading(true);
    setfunds(await findAllfunds(page));
    setIsLoading(false);
  }
  
  useEffect(() => {

    if (isLoading) {
      fetchfunds(0);
    }
  }, []);

  return (
    <section id="home-grid" aria-label="Explore and fund one of our funds" className="pt-20 pb-14 sm:pb-20 sm:pt-32 lg:pb-32">
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Fund one of our funds
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Because you’d probably be a little confused if we didn't ask you to fund any, right?
          </p>
        </div>

        <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {funds.total > 0 ? (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {funds.funds.map(fund => <fundThumbnail key={fund.address} fund={fund} />)}
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
    </section>
  )
}
