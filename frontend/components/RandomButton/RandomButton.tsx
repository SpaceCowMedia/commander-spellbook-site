import Link from "next/link";
import {Url} from "url";

type Props = {
  query?: string
  children?: React.ReactNode
  className?: string
}

const RandomButton = ({ query, children, className }: Props) => {

  const link: Partial<Url> = {pathname: "/random"}
  if (query) link.query = query

  return (
    <Link href={link} className={className}>
      {children}
    </Link>
  )
}

export default RandomButton