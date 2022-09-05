import { useEffect, useState } from 'react'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { DaoThumbnail } from '@/components/DaoThumbnail'
import { Dao } from '@prisma/client'
import { findAllDaos } from '@/common/fetchers'

export function HomeGrid() {

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
    <section id="home-grid" aria-label="Explore and fund one of our DAOs" className="pt-20 pb-14 sm:pb-20 sm:pt-32 lg:pb-32">
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Fund one of our DAOs
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
              {daos.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {daos.map(dao => <DaoThumbnail key={dao.address} dao={dao} />)}
                </div>
              ) : (
                <span>No daos yet...</span>
              )}
            </>
          )}
        </div>
      </Container>
    </section>
  )
}
