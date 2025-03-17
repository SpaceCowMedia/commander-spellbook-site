import React from 'react';
import ExternalLink from '../ExternalLink/ExternalLink';
import EDHRECService from '../../../services/edhrec.service';

type Props = {
  name: string;
  children?: React.ReactNode;
  className?: string;
  disableMobileSingleClickAsPreview?: boolean;
};

const CardLink: React.FC<Props> = ({ name, children, className, disableMobileSingleClickAsPreview }: Props) => {
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

  // prevent single click on mobile
  const handleSingleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disableMobileSingleClickAsPreview && window.innerWidth <= 1024) {
      event.preventDefault();
    }
  };

  // allow double click on mobile
  const handleDoubleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disableMobileSingleClickAsPreview && window.innerWidth <= 1024) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      //Do nothing
      event.preventDefault();
    }
  };

  return (
    <ExternalLink className={className} href={link} onClick={handleSingleClick} onDoubleClick={handleDoubleClick}>
      {children}
    </ExternalLink>
  );
};

export default CardLink;
