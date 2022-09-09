import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Fund } from '@prisma/client'
import { findFund, isFundAdmin, updateFund } from '@/common/fetchers'
import { Container } from '@/components/Container'
import { Loading } from '@/components/Loading'
import { getServerSideProps } from '@/common/session/index.ts'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

const ManageFund: NextPage = ({ dehydratedState }) => {
  const router = useRouter()
  const { slug } = router.query
  const [isLoading, setIsLoading] = useState(true);
  const [Fund, setFund] = useState<Fund>({});
  const [avatar, setAvatar] = useState();
  const [fileName, setFileName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (event:any) => {
    const target = event.target;
    const name = target.name;

    let value = target.value;
    if (target.type == 'checkbox') {
      value = target.checked;
    } else if (target.type == 'file') {
      value = event.target.files[0];
    }

    if (name == "avatar") {
      setAvatar(value);
      setFileName(`${target.files[0].name} chosen`);
    } else {
      setFund(prevState => { return { ...prevState, [name]: value } });
    }
  }

  const removeAvatar = async () => {
    setAvatarRemoved(true);
  }

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  const update = async () => {
    if (Fund.name == '') {
      showErrorMessage('Please enter a name.'); return;
    }

    const formData = new FormData();
    formData.append("file", avatar);
    formData.append("updateAvatar", avatarRemoved);
    formData.append("name", Fund.name);
    formData.append("about", Fund.about);
    formData.append("slug", Fund.slug);
    formData.append("dehydratedState", dehydratedState);

    const res = await updateFund(Fund.slug, formData);
    const data = await res.json();
    if (res.status === 200) {
      router.push(`/Funds/${data.slug}`);
    } else {
      showErrorMessage(data);
    }
  }

  useEffect(() => {
    const fetchInfo = async (slug: string) => {
      const [
        Fund,
        isAdmin
      ] = await Promise.all([
        findFund(slug),
        isFundAdmin(slug, dehydratedState)
      ]);
      setFund(Fund);
      setIsAdmin(isAdmin);

      setIsLoading(false);
    };

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
        <main className="max-w-5xl">

          {/* HEADER */}
          <Link href={`/Funds/${Fund.slug}`}>
            <h1 className="text-2xl font-bold text-gray-900">{Fund.name}</h1>
          </Link>

          {/* ERROR MESSAGES */}
          {errorMessage != "" ? (
            <div className="mt-3">
              <Alert type={Alert.type.ERROR}>
                  {errorMessage}
              </Alert>
            </div>
          ): null}
          {!isAdmin ? (
            <div className="mt-3">
              <Alert type={Alert.type.ERROR}>
                Only admins can update Fund info
              </Alert>
            </div>
          ): null}

          {/* FORM */}
          <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">What is your Fund called?</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                    onChange={handleInputChange}
                    value={Fund.name}
                  />
                </div>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Avatar</label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                {avatarRemoved ? (
                  <label htmlFor="avatar" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                    <div className="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-center text-sm text-gray-600">
                          {fileName ? (
                            <span>{fileName}</span>
                          ) : (
                            <span>Upload a file</span>
                          )}
                          <input id="avatar" name="avatar" type="file" className="sr-only" onChange={handleInputChange} />
                        </div>
                        {!fileName ? (
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        ) : null}
                      </div>
                    </div>
                  </label>
                ):(
                  <div className="max-w-3xl mx-auto grid max-w-7xl grid-cols-6 items-center">
                    <div className="lg:col-span-1 w-full h-full rounded-md overflow-hidden">
                      <img
                        src={`${Fund.avatar}`}
                        className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                      />
                    </div>
                    <section className="col-span-3"> 
                      <button className='text-red-500 ml-4' onClick={() => removeAvatar()}>
                        Remove
                      </button>
                    </section>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> About </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="about"
                  name="about"
                  rows="3"
                  className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                  onChange={handleInputChange}
                  value={Fund.about}
                ></textarea>
                <p className="mt-2 text-sm text-gray-500">Write a few sentences about the purpose of the Fund and the fundraise.</p>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="pt-5 pb-5">
              <div className="flex justify-end">
                <Button onClick={() => update()}>
                  Save
                </Button>
              </div>
            </div>
          ): null}
        </main>
      )}
    </Container>
  )
};

export { getServerSideProps };
export default ManageFund
