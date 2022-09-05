import { StyledIcon } from '@/components/StyledIcon'

export function ActivityFeedItem({
  icon,
  title,
  subtitle,
  details
}) {
  return (
    <li key={title}>
      <div className="relative flex space-x-3 items-center pb-3">
        <div>
          <span className='bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'>
            <StyledIcon
              as={icon}
              size={6}
              solid={false}
              className="text-white"
            />
          </span>
        </div>
        <div className="min-w-0 flex-1 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-500">
              {title}
            </p>
            <p className="text-xs text-gray-400 -mt-1">
              {subtitle}
            </p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime='2022-01-08'>{details}</time>
          </div>
        </div>
      </div>
    </li>
  )
}
