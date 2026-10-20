import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
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
      <ExternalLink
        data-tooltip-place="bottom"
        data-tooltip-id={id}
        data-tooltip-content={`Share ${subject} on ${network}`}
        href={url}
        className={className}
      >
        {children}
      </ExternalLink>
      <Tooltip id={id} />
    </>
  );
};

export default ShareNetwork;
