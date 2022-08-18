import { FC } from 'react'

export const DaoThumbnail: FC = ({ dao }) => {
  return (
    <div className="group relative">
      <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
        <img
          src='https://as1.ftcdn.net/v2/jpg/03/32/69/82/1000_F_332698203_XmQ4jYo8vDPfgeqZ3Ake9xfRMS7ChD15.jpg'
          className="w-full h-full object-center object-cover lg:w-full lg:h-full"
        />
      </div>
      <div className="mt-2 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <a href='#'>
              <span aria-hidden="true" className="absolute inset-0" />
              A DAO
            </a>
          </h3>
          <p className="text-sm text-gray-500">Story truncated</p>
        </div>
      </div>
    </div>
  );
}
