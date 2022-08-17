import type { NextPage } from 'next'
import { Container } from '@/components/Container'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'

const New: NextPage = () => {
  const [state, setState] = useState({ name: '' });

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setState(prevState => { return { ...prevState, [name]: value } });
  }

  return (
    <Container className="max-w-7xl">
      <form className="space-y-8 divide-y divide-gray-200 mt-12">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Start your Bitcoin DAO</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">This information will be displayed publicly.</p>
            </div>

            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> What is your DAO called? </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autocomplete="name"
                      className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                      onChange={handleInputChange}
                      value={state.name}
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label for="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> About </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea id="about" name="about" rows="3" className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"></textarea>
                  <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <Button type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default New
