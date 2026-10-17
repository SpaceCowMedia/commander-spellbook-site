import Link from 'next/link';
import React from 'react';
import { Tooltip } from 'react-tooltip';

interface Props {
  className?: string;
  url: string;
  children?: React.ReactNode;
  network: string;
  subject: string;
}

const ShareNetwork: React.FC<Props> = ({ className, url, children, network, subject }) => {
  const id = `share-${subject.toLowerCase()}-tooltip-${network}`;
  return (
    <>
      <Link
        data-tooltip-place="bottom"
        data-tooltip-id={id}
        data-tooltip-content={`Share ${subject} on ${network}`}
        href={url}
        className={className}
        rel="noreferrer noopener"
        target="_blank"
      >
        {children}
      </Link>
      <Tooltip id={id} />
    </>
  );
};

export default ShareNetwork;
