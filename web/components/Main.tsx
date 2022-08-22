import { useEffect, useState } from 'react'
import { Container } from '@/components/Container'

import { Loading } from '@/components/Loading'
import { DaoThumbnail } from '@/components/DaoThumbnail'

import { Dao } from '@prisma/client'

import { findAllDaos } from '@/common/fetchers'

export function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const [daos, setDaos] = useState<Dao[]>([]);

  useEffect(() => {
    const fetchDaos = async () => {
      // TODO: paginate DAOs
      setDaos(await findAllDaos());
      setIsLoading(false);
    }

    if (isLoading) {
      fetchDaos();
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
            {daos.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {daos.map(dao => <DaoThumbnail key={dao.publicKey} dao={dao} />)}
              </div>
            ) : (
              <span>No daos yet...</span>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
