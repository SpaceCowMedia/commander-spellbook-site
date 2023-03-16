import React from "react";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
} & React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

const ExternalLink: React.FC<Props> = (props: Props) => {
  const { children, disabled } = props;
  const attributes = {
    ...props,
    target: "_blank",
    rel: "noopener noreferrer",
  };

  if (disabled) {
    delete attributes.href;
  }

  return (
    <a {...attributes}>
      {children}
    </a>
  );
};

export default ExternalLink;
