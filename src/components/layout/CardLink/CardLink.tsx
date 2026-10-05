import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ExternalLink from '../ExternalLink/ExternalLink';
import EDHRECService from '../../../services/edhrec.service';
import { cardPath, CardReference } from 'lib/cards';

interface Props {
  card: CardReference & { name: string };
  children?: React.ReactNode;
  className?: string;
  disableMobileSingleClickAsPreview?: boolean;
  newTab?: boolean;
}

const CardLink: React.FC<Props> = ({ card, children, className, disableMobileSingleClickAsPreview, newTab }) => {
  const router = useRouter();
  const internalLink = cardPath(card);
  const link = internalLink ?? EDHRECService.getCardUrl(card.name);
  const opensNewTab = newTab || internalLink === undefined;

  const previewsOnSingleClick = () => !disableMobileSingleClickAsPreview && window.innerWidth <= 1024;

  // prevent single click on mobile
  const handleSingleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (previewsOnSingleClick()) {
      event.preventDefault();
    }
  };

  // allow double click on mobile
  const handleDoubleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!previewsOnSingleClick()) {
      return;
    }
    if (opensNewTab) {
      // A features argument, even just noopener, makes some browsers open a popup window instead of a tab
      const opened = window.open(link, '_blank');
      if (opened) {
        opened.opener = null;
      }
    } else {
      router.push(link);
    }
  };

  if (opensNewTab) {
    return (
      <ExternalLink className={className} href={link} onClick={handleSingleClick} onDoubleClick={handleDoubleClick}>
        {children}
      </ExternalLink>
    );
  }
  return (
    <Link
      className={className}
      href={link}
      prefetch={false}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </Link>
  );
};

export default CardLink;
