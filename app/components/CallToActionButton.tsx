import { useContext } from 'react'
import { MdSearch } from 'react-icons/md'
import {
  BackgroundColor,
  BackgroundColorContext,
} from '../contexts/backgroundColorContext'

type CallToActionButtonProps = {
  text: string
  linkUrl: string
}

const CallToActionButton = ({ text, linkUrl }: CallToActionButtonProps) => {
  const backgroundColor = useContext(BackgroundColorContext)

  // for some reason, tailwind doesn't let you concatenate classes
  // with the hover: prefix at runtime, so we have to do this
  let hoverTextColor = null

  if (backgroundColor === BackgroundColor.GREEN) {
    hoverTextColor = 'hover:text-brand-green'
  } else if (backgroundColor === BackgroundColor.RED) {
    hoverTextColor = 'hover:text-brand-red'
  } else {
    hoverTextColor = 'hover:text-brand-yellow'
  }

  return (
    <a
      className={`flex items-center rounded-full border-2 border-brand-purple py-2 pl-4 pr-5 text-[16px] transition-colors hover:bg-brand-purple ${hoverTextColor} md:text-[18px]`}
      href={linkUrl}
      target='_blank'
    >
      <MdSearch size='24px' className='mr-3' /> {text}
    </a>
  )
}

export default CallToActionButton
