import { GetServerSideProps } from 'next';
import ErrorBase from '../components/layout/ErrorBase/ErrorBase';
import React from 'react';

const UNKNOWN_TEMPLATES = ['apocalypse', 'obliterate', 'bookBurning'];

interface Props {
  template: string;
}

const UnknownErrorPage: React.FC<Props> = ({ template }) => {
  return (
    <>
      <ErrorBase
        mainMessage="Uh Oh"
        subMessage="Something went wrong. Try again in a few minutes."
        containerClassName={template}
      />
    </>
  );
};

export default UnknownErrorPage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const randomIndex = Math.floor(Math.random() * UNKNOWN_TEMPLATES.length);
  return {
    props: {
      template: UNKNOWN_TEMPLATES[randomIndex],
    },
  };
};
