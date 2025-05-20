import React from 'react';
import SpellbookHead from '../../../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import ComboSubmissionForm from 'components/submission/ComboSubmissionForm/ComboSubmissionForm';
import { apiConfiguration } from 'services/api.service';
import { VariantSuggestion, VariantSuggestionsApi } from '@space-cow-media/spellbook-client';
import CookieService from 'services/cookie.service';
import TokenService from 'services/token.service';

type Props = {
  submission: VariantSuggestion;
};

const EditSubmission: React.FC<Props> = ({ submission }) => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Update Combo Submission"
        description="Changed your mind? Edit your combo submission."
      />
      <ComboSubmissionForm submission={submission} />
    </>
  );
};

export default EditSubmission;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csbUsername = await CookieService.get<Promise<string>>('csbUsername', { req: context.req, res: context.res });
  const csbJwt = await TokenService.getTokenFromServerContext(context);
  const submissionIdRaw = context.params?.id;
  if (!csbUsername || !csbJwt) {
    return {
      redirect: {
        destination: `/login?final=my-submissions/${submissionIdRaw}`,
        permanent: false,
      },
    };
  }
  if (typeof submissionIdRaw !== 'string') {
    return {
      redirect: {
        destination: '/my-submissions',
        permanent: false,
      },
    };
  }
  const submissionId = parseInt(submissionIdRaw, 10);
  if (isNaN(submissionId)) {
    return {
      redirect: {
        destination: '/my-submissions',
        permanent: false,
      },
    };
  }
  const configuration = apiConfiguration(context);
  const submissionsApi = new VariantSuggestionsApi(configuration);
  const submission = await submissionsApi.variantSuggestionsRetrieve({ id: submissionId });
  // Create a new object without the 'created' property
  const { created: _, ...submissionWithoutCreated } = submission;
  return {
    props: {
      submission: submissionWithoutCreated,
    },
  };
};
