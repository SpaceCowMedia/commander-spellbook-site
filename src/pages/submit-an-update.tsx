import React from 'react';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CookieService from 'services/cookie.service';
import TokenService from 'services/token.service';
import UpdateSubmissionForm from 'components/submission/UpdateSubmissionForm/UpdateSubmissionForm';

type Props = {
  comboId?: string;
};

const SubmitAnUpdate: React.FC<Props> = ({ comboId }) => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: How to Submit an Update"
        description="Learn how to contribute to Commander Spellbook by submitting a new combo."
      />
      <UpdateSubmissionForm comboId={comboId} />
    </>
  );
};

export default SubmitAnUpdate;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csbUsername = CookieService.get('csbUsername', { req: context.req, res: context.res });
  const csbJwt = await TokenService.getTokenFromServerContext(context);
  if (!csbUsername || !csbJwt) {
    return {
      redirect: {
        destination: '/login?final=submit-an-update',
        permanent: false,
      },
    };
  }
  const { comboId } = context.query;
  return {
    props: {
      comboId: typeof comboId === 'string' ? comboId : null,
    },
  };
};
