import ExternalLink from "../../../layout/ExternalLink/ExternalLink";

type Props = {
  link: string;
};

const EdhrecLink = ({ link }: Props) => {
  return (
    <ExternalLink href={link} className="button w-full">
      View on EDHREC
    </ExternalLink>
  );
};

export default EdhrecLink;
