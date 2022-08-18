import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { findDao } from '@/common/fetchers';
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'

const DaoDetails: NextPage = () => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState({}); // TODO: should we create a TypeScript type for a DAO?

  useEffect(() => {
    const fetchDao = async () => {
      console.log('Looking for DAO with slug', slug);
      setDao(await findDao(slug));

      setIsLoading(false);
    };

    if (slug) {
      fetchDao();
    }
  }, [slug]);

  return (
    <Container>
      {isLoading ? (
        <div className="flex flex-wrap mb-12">
          <Loading />
        </div>
      ) : (
        <>
          <span>This is loaded: {dao.name}</span>
        </>
      )}
    </Container>
  )
};

export default DaoDetails
