import React from 'react';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ComboSubmissionForm from '../components/submission/ComboSubmissionForm/ComboSubmissionForm';
import CookieService from 'services/cookie.service';
import TokenService from 'services/token.service';
import { queryParameterAsString } from 'lib/queryParameters';
import { Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';

type Props = {
  variant?: Variant;
};

const SubmitACombo: React.FC<Props> = ({ variant }) => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: How to Submit a Combo"
        description="Learn how to contribute to Commander Spellbook by submitting a new combo."
      />
      <ComboSubmissionForm variant={variant} />
    </>
  );
};

export default SubmitACombo;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csbUsername = CookieService.get('csbUsername', { req: context.req, res: context.res });
  const csbJwt = await TokenService.getTokenFromServerContext(context);
  const variantOf = queryParameterAsString(context.query.variantOf);
  let variant: Variant | undefined;
  if (!csbUsername || !csbJwt) {
    return {
      redirect: {
        destination: `/login?final=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }
  if (variantOf) {
    try {
      const configuration = apiConfiguration(context);
      const variantsApi = new VariantsApi(configuration);
      variant = await variantsApi.variantsRetrieve({ id: variantOf });
    } catch {
      /* empty */
    }
  }
  return {
    props: {
      variant: variant || null,
    },
  };
};
