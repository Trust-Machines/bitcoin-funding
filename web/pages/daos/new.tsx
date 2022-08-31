import type { NextPage } from 'next'
import { Container } from '@/components/Container'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { createDao, getBtcPrice } from '@/common/fetchers'
import { useRouter } from 'next/router'
import { Alert } from '@/components/Alert';

const New: NextPage = () => {
  const router = useRouter();
  const [state, setState] = useState({
    name: 'Racing with Children',
    about: 'We organise races for children who come from underprivileged areas in the United States',
    raisingAmount: 25000,
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    raisingDeadline: '2023-01-01',
    image: null
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [btcPrice, setBtcPrice] = useState(0.0);

  const handleInputChange = (event: any) => {
    const target = event.target;
    const name = target.name;

    let value = target.value;
    if (target.type == 'checkbox') {
      value = target.checked;
    } else if (target.type == 'file') {
      value = event.target.files[0];
    }

    setState(prevState => { return { ...prevState, [name]: value } });
    setErrorMessage("");
  }

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  const submitCreateDao = async () => {

    if (state.name == '') {
      showErrorMessage('Please enter a name.'); return;
    } else if (state.raisingAmount == 0) {
      showErrorMessage('Please enter an amount to raise.'); return;
    } else if (state.address == '') {
      showErrorMessage('Please enter a valid BTC address.'); return;
    } else if (state.raisingDeadline == '') {
      showErrorMessage('Please enter a raising deadline.'); return;
    }

    const formData = new FormData();
    formData.append("file", state.image);
    formData.append("name", state.name);
    formData.append("about", state.about);
    formData.append("raisingAmount", ((state.raisingAmount / btcPrice) * 100000000.0).toString());
    formData.append("address", state.address);
    formData.append("raisingDeadline", state.raisingDeadline);
    formData.append("registrationTxId", "1");
    
    const res = await createDao(formData);
    const data = await res.json();
    if (res.status === 200) {
      router.push(`/daos/${data.slug}`);
    } else {
      showErrorMessage(data);
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
      <div className="space-y-8 divide-y divide-gray-200 mt-12 max-w-5xl">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Start your Bitcoin DAO</h3>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Avatar</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex rounded-md shadow-sm">
                    {/* TODO: nice upload field */}
                    <input type="file" name="image" onChange={handleInputChange} />
                  </div>
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
                      $
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">That is {state.raisingAmount / btcPrice} BTC at current prices</p>
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
            <Button onClick={() => submitCreateDao()}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default New
