import type { NextPage } from 'next'
import { Container } from '@/components/Container'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { createFund, getBtcPrice } from '@/common/fetchers'
import { useRouter } from 'next/router'
import { Alert } from '@/components/Alert';
import { getServerSideProps } from '@/common/session/index.ts';
import { Loading } from '@/components/Loading';
import { validate } from 'bitcoin-address-validation';
import { dollarAmountToString } from '@/common/utils'

const New: NextPage = ({ dehydratedState }) => {
  const router = useRouter();
  const [state, setState] = useState({
    name: 'Racing with Children',
    about: 'We organise races for children who come from underprivileged areas in the United States',
    raisingAmount: 2,
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    raisingDeadline: '2023-01-01',
    image: null
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [btcPrice, setBtcPrice] = useState(0.0);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (event: any) => {
    const target = event.target;
    const name = target.name;

    let value = target.value;
    if (target.type == 'checkbox') {
      value = target.checked;
    } else if (target.type == 'file' && event.target.files.length > 0) {
      value = event.target.files[0];
      setFileName(`${target.files[0].name} chosen`);
      const src = URL.createObjectURL(value);
      const preview = document.getElementById("preview");
      preview.src = src;
      preview.style.display = "block";
    }

    setState(prevState => { return { ...prevState, [name]: value } });
    setErrorMessage("");
  }

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  const submitCreateFund = async () => {
    if (state.name == '') {
      showErrorMessage('Please enter a name.'); return;
    } else if (state.raisingAmount == 0) {
      showErrorMessage('Please enter an amount to raise.'); return;
    } else if (state.address == '' || !validate(state.address)) {
      showErrorMessage('Please enter a valid BTC address.'); return;
    } else if (state.raisingDeadline == '') {
      showErrorMessage('Please enter a raising deadline.'); return;
    }
    setIsSaving(true);

    const formData = new FormData();
    formData.append("file", state.image);
    formData.append("name", state.name);
    formData.append("about", state.about);
    formData.append("raisingAmount", (state.raisingAmount * 100000000.0).toString());
    formData.append("address", state.address);
    formData.append("raisingDeadline", state.raisingDeadline);
    formData.append("dehydratedState", dehydratedState);

    const res = await createFund(formData);
    const data = await res.json();

    if (res.status === 200) {
      router.push(`/funds/${data.slug}`);
    } else {
      showErrorMessage(data);
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const fetchBtcPrice = async () => {
      const btcPrice = await getBtcPrice();
      setBtcPrice(btcPrice);
    };

    fetchBtcPrice();
  }, []);

  return (
    <Container className="max-w-7xl">
      {isLoading ? (
        <div className="flex flex-wrap mb-12">
          <Loading />
        </div>
      ) : (
        <div className="space-y-8 divide-y divide-gray-200 mt-12 max-w-5xl">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Start your Bitcoin Fund</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">This information will be displayed publicly.</p>
              </div>
              
              {errorMessage != "" ? (
                <div className="mt-3">
                  <Alert type={Alert.type.ERROR}>
                    {errorMessage}
                  </Alert>
                </div>
              ): null}

              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
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
                        value={state.name}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Avatar</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <label htmlFor="image" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
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
                            <input id="image" name="image" type="file" accept="image/*" className="sr-only" onChange={handleInputChange} />
                            <img id="preview" className="mt-2" />
                          </div>
                          {!fileName ? (
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          ) : null}
                        </div>
                      </div>
                    </label>
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
                      value={state.about}
                    ></textarea>
                    <p className="mt-2 text-sm text-gray-500">Write a few sentences about the purpose of the DAO and the fundraise.</p>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="raisingAmount" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">How much do you want to raise?</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="raisingAmount"
                        id="raisingAmount"
                        autoComplete="raisingAmount"
                        className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                        onChange={handleInputChange}
                        value={state.raisingAmount}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        BTC
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      That is {' '}
                      {dollarAmountToString(state.raisingAmount * btcPrice)}
                      {' '} at current prices
                    </p>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Enter your Bitcoin DAO address</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        autoComplete="address"
                        className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        onChange={handleInputChange}
                        value={state.address}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Your Bitcoin address is the funding address where donors will send funds. We highly recommend you use a new Electrum, Casa, Trezor or Ledger Bitcoin address. This will allow you to keep the funds you collect in one place and to distuingish them from previous transactions at this address.
                    </p>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="raisingDeadline" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">When will deposits close?</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="max-w-lg flex rounded-md shadow-sm">
                      <input
                        type="date"
                        name="raisingDeadline"
                        id="raisingDeadline"
                        autoComplete="raisingDeadline"
                        className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                        onChange={handleInputChange}
                        value={state.raisingDeadline}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Deposits will close end of day (23:59 PST).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 pb-5">
              <div className="flex justify-end">
                <Button onClick={() => submitCreateFund()} saving={isSaving}>
                  Save
                </Button>
              </div>
            </div>
        </div>
      )}
    </Container>
  )
}

export { getServerSideProps };
export default New
