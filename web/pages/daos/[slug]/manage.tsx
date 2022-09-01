import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Dao } from '@prisma/client'
import { findDao, isDaoAdmin, updateDao } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts'

const ManageDao: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [dao, setDao] = useState<Dao>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchInfo = async (slug: string) => {
      const [
        dao,
        isAdmin
      ] = await Promise.all([
        findDao(slug),
        isDaoAdmin(slug, dehydratedState)
      ]);
      setDao(dao);
      setIsAdmin(isAdmin);

      setIsLoading(false);
    };

    if (slug) {
      fetchInfo(slug as string);
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
          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-6">
            <div className="space-y-6 lg:col-span-1">
              <section>
                <div className="w-full min-h-80 min-w-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                  <img
                    src={`${dao.avatar}`}
                    className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                  />
                </div>
              </section>
            </div>

            <section className="lg:col-span-3">
              <div className="max-w-3xl mt-4 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                <div className="flex items-center space-x-5">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dao.name}</h1>
                    <p className="text-sm font-medium text-gray-500">
                      {dao.about}                  
                    </p>
                  </div>
                </div>
              </div>
            </section>
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

                    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Avatar</label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        {/* TODO: nice upload field */}
                        <input type="file" name="image" onChange={handleInputChange} />
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

                  {isAdmin ? (
                    <div>
                      <a
                        onClick={() => { update() }}
                        className="cursor-pointer block bg-blue-600 text-sm font-medium text-white text-center px-4 py-4 hover:bg-blue-700 sm:rounded-b-lg"
                      >
                        Update DAO Information
                      </a>
                    </div>
                  ):(
                    <div>
                      <p
                        className="block bg-red-600 text-sm font-medium text-white text-center px-4 py-4 sm:rounded-b-lg"
                      >
                        Only admins can update DAO information
                      </p>
                    </div>
                  )}

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
