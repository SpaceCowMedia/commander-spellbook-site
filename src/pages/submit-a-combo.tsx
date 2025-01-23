import React from 'react';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import ComboSubmissionForm from 'components/submission/ComboSubmissionForm/ComboSubmissionForm';
import CookieService from 'services/cookie.service';

const SubmitACombo: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: How to Submit a Combo"
        description="Learn how to contribute to Commander Spellbook by submitting a new combo."
      />
      <ComboSubmissionForm />
    </>
  );
};

export default SubmitACombo;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csbUsername = CookieService.get('csbUsername', { req: context.req, res: context.res });
  const csbJwt = CookieService.get('csbJwt', { req: context.req, res: context.res });
  if (!csbUsername || !csbJwt) {
    return {
      redirect: {
        destination: '/login?final=submit-a-combo',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
