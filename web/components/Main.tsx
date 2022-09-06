import { useEffect, useState } from 'react'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { DaoThumbnail } from '@/components/DaoThumbnail'
import { findAllDaos } from '@/common/fetchers'
import { Pagination } from './Pagination'
import { DaosPaged } from 'pages/api/dao/all'

export function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const [daos, setDaos] = useState<DaosPaged>({});

  const pageSelected = (page: Number) => {
    if (page >= 0 && page < daos.totalPages) {
      fetchDaos(page);
    }
  }

  const fetchDaos = async (page: Number) => {
    setIsLoading(true);
    setDaos(await findAllDaos(page));
    setIsLoading(false);
  }

  useEffect(() => {
    if (isLoading) {
      fetchDaos(0);
    }
  }, []);

  return (
    <Container className="min-h-screen">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Our popular DAOs</h2>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            {daos.total > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {daos.daos.map(dao => <DaoThumbnail key={dao.address} dao={dao} />)}
                </div>
                <div className='mt-8 text-center'>
                  <Pagination totalPages={daos.totalPages} currentPage={daos.currentPage} pageSelected={pageSelected}/>
                </div>
              </>
            ) : (
              <span>No daos yet...</span>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
