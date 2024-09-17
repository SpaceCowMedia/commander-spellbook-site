import React from 'react';
import ExternalLink from '../ExternalLink/ExternalLink';
import EDHRECService from '../../../services/edhrec.service';

type Props = {
  name: string;
  children?: React.ReactNode;
  className?: string;
};

const CardLink: React.FC<Props> = ({ name, children, className }: Props) => {
  let link = '';
  const edhrecLink = EDHRECService.getCardUrl(name);
  if (edhrecLink) {
    link = edhrecLink;
  } else {
    let quotes = '%22';
    if (name.includes('"')) {
      quotes = '%27';
    }
    link = `https://scryfall.com/search?q=%21${quotes}${encodeURIComponent(name)}${quotes}`;
  }

  return (
    <ExternalLink className={className} href={link}>
      {children}
    </ExternalLink>
  );
};

export default CardLink;
