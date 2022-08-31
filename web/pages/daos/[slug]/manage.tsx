import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { Dao } from '@prisma/client'

import { findDao, updateDao } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { StyledIcon } from '@/components/StyledIcon'
import { getServerSideProps } from '@/common/session/index.ts'

const ManageDao: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});

  useEffect(() => {
    const fetchDao = async () => {
      const dao = await findDao(slug);
      setDao(dao);

      const parsedState = JSON.parse(dehydratedState) || []
      if (dao.admins && dao.admins.length > 0 && parsedState.length > 0) {
        const account = parsedState[1][1][0];
        const isAdmin = dao.admins.findIndex(i => i['userId'] === account['appPrivateKey']) !== -1;
        if (!isAdmin) {
          // Not an admin
          // TODO: show error message
          router.push('/');
        }
      } else {
        // no admins found or not logged in - no management possible
        // TODO: show error message
        router.push('/');
      }

      setIsLoading(false);
    };

    if (slug) {
      fetchDao();
    }
  }, [slug]);

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setDao(prevState => { return { ...prevState, [name]: value } });
  }

  const update = async () => {
    const res = await updateDao(dao.slug, dao, dehydratedState);
    if (res.status === 200) {
      console.log(res);
      const data = await res.json();
      router.push(`/daos/${data.slug}`);
    } else {
      console.log(res);
      console.log('TODO: DAO update did not succeed.. show error message');
    }
  }

  return (
    <Container className="min-h-screen">
      {isLoading ? (
        <div className="flex flex-wrap mb-12">
          <Loading />
        </div>
      ) : (
        <main className="py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
            <div className="flex items-center space-x-5">
              <div>
                <Link href={`/daos/${dao.slug}`}>
                  <h1 className="text-2xl font-bold text-gray-900">{dao.name}</h1>
                </Link>
                <p className="text-sm font-medium text-gray-500">
                  {dao.about}                  
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8 mt-4">
            <img
              className="w-full max-h-60"
              src="https://as1.ftcdn.net/v2/jpg/03/32/69/82/1000_F_332698203_XmQ4jYo8vDPfgeqZ3Ake9xfRMS7ChD15.jpg"
            />
          </div>

          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2">
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 id="about" className="text-lg leading-6 font-medium text-gray-900">
                      Manage {dao.name}
                    </h2>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">What is your DAO called?</label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            autoComplete="name"
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                            onChange={handleInputChange}
                            value={dao.name}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 mt-5">
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> About </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <textarea
                          id="about"
                          name="about"
                          rows="3"
                          className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                          onChange={handleInputChange}
                          value={dao.about}
                        ></textarea>
                        <p className="mt-2 text-sm text-gray-500">Write a few sentences about the purpose of the DAO and the fundraise.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a
                      onClick={() => { update() }}
                      className="cursor-pointer block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                    >
                      Update DAO Information
                    </a>
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
export default ManageDao
