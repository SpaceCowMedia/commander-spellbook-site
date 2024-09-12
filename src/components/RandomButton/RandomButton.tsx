import Link from "next/link";
import React from "react";
import { Url } from "url";

type Props = {
  query?: string;
  children?: React.ReactNode;
  className?: string;
};

const RandomButton: React.FC<Props> = ({ query, children, className }) => {
  const link: Partial<Url> = { pathname: "/random" };
  if (query) {
    link.query = query;
  }

  return (
    <Link href={link} className={className}>
      {children}
    </Link>
  );
};

export default RandomButton;
