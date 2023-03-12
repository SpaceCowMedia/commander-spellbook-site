import React from "react";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
} & React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

const ExternalLink: React.FC<Props> = (props: Props) => {
  const { children, disabled, href } = props;
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      href={disabled ? "" : href}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
