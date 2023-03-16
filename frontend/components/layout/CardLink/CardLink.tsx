import React from "react";
import ExternalLink from "../ExternalLink/ExternalLink";
import Card from "lib/card";

type Props = {
  name: string;
  children?: React.ReactNode;
  className?: string;
};

const CardLink: React.FC<Props> = ({ name, children, className }: Props) => {
  const card = new Card(name);

  let link = "";
  const edhrecLink = card.getEdhrecLink();
  if (edhrecLink) link = edhrecLink;
  else {
    let quotes = "%22";
    if (name.includes('"')) quotes = "%27";
    link = `https://scryfall.com/search?q=%21${quotes}${encodeURIComponent(
      name
    )}${quotes}`;
  }

  return (
    <ExternalLink className={className} href={link}>
      {children}
    </ExternalLink>
  );
};

export default CardLink;
