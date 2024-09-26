import React from 'react';

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  disabled?: boolean;
  children?: React.ReactNode;
}

const ExternalLink: React.FC<Props> = (props) => {
  const { disabled, children } = props;
  const attributes = {
    ...props,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  if (disabled) {
    delete attributes.href;
  }

  return <a {...attributes}>{children}</a>;
};

export default ExternalLink;
