import ErrorBase from '../components/layout/ErrorBase/ErrorBase';
import React, { useEffect } from 'react';

const UNKNOWN_TEMPLATES = ['apocalypse', 'obliterate', 'bookBurning'];

interface Props {
  template: string;
}

const UnknownErrorPage: React.FC<Props> = () => {
  const [index, setIndex] = React.useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * UNKNOWN_TEMPLATES.length));
  }, []);

  return (
    <>
      <ErrorBase
        mainMessage="Uh Oh"
        subMessage="Something went wrong. Try again in a few minutes."
        containerClassName={UNKNOWN_TEMPLATES[index]}
      />
    </>
  );
};

export default UnknownErrorPage;
