export function AdminItem({
  address,
  isNew
}) {
  return (
    <div key={address}>
      {isNew ? (
        <p className="text-sm text-green-800 mb-2 font-medium">
          {address}
        </p>
      ):(
        <p className="text-sm text-gray-800 mb-2">
          {address}
        </p>
      )}
    </div>
  )
}
