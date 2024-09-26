import React from 'react';
import ExternalLink from '../../../layout/ExternalLink/ExternalLink';

type Props = {
  link: string;
};

const EdhrecLink: React.FC<Props> = ({ link }) => {
  return (
    <ExternalLink href={link} className="button w-full">
      View on EDHREC
    </ExternalLink>
  );
};

export default EdhrecLink;
