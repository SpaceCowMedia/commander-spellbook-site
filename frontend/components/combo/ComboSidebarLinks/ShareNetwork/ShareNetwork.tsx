import Link from "next/link";
import {Tooltip} from 'react-tooltip'
type Props = {
  className?: string
  url: string
  children?: React.ReactNode
  network: string
}

const ShareNetwork = ({ className, url, children, network}: Props) => {
  const id = `share-combo-tooltip-${network}`
  return (
    <>
      <Link data-tooltip-place="bottom" data-tooltip-id={id} data-tooltip-content={`Share Combo on ${network}`} href={url} className={className} rel="noreferrer noopener" target="_blank">
          {children}
      </Link>
      <Tooltip id={id} />
    </>
  )
}

export default ShareNetwork
