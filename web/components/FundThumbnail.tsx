import { FC } from 'react'
import Link from 'next/link'

export const FundThumbnail: FC = ({ fund }) => {
  return (
    <div className="group relative">
      <div className="w-full min-h-80 min-w-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
        <img
          src={`${fund.avatar}`}
          className="w-full h-full object-center object-cover lg:w-full lg:h-full"
        />
      </div>
      <div className="mt-2 flex justify-between">
        <div>
          <h3 className="text-md text-gray-700">
            <Link href={`/funds/${fund.slug}`}>
              <>
                <span aria-hidden="true" className="absolute inset-0" />
                {fund.name}
              </>
            </Link>
          </h3>
          <p className="text-sm text-gray-500">
            {fund.about.length > 70 ? (
              fund.about.substring(0, 70) + "..."
            ) : (
              fund.about
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
