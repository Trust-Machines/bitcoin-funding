export function AdminItem({
  address,
  isNew,
  isOwn,
  remove
}) {
  return (
    <div key={address}  className="mt-1 sm:mt-0 sm:col-span-2 mb-2 text-sm ">
      <div className="max-w-lg flex items-center">
        {isNew ? (
          <p className="text-green-800 font-medium">
            {address}
          </p>
        ):(
          <p className="text-gray-800">
            {address}
          </p>
        )}
        {isOwn ? (
          <p className="text-gray-600 ml-2 font-medium">
            (You)
          </p>
        ):(
          <a
            onClick={() => { remove(address) }}
            className="text-red-500 ml-2 cursor-pointer"
          >
            Remove
          </a>
        )}
      </div>
    </div>
  )
}
