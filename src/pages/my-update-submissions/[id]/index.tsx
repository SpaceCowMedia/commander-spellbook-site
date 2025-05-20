import React from 'react';
import SpellbookHead from '../../../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import { apiConfiguration } from 'services/api.service';
import { VariantUpdateSuggestion, VariantUpdateSuggestionsApi } from '@space-cow-media/spellbook-client';
import CookieService from 'services/cookie.service';
import TokenService from 'services/token.service';
import UpdateSubmissionForm from 'components/submission/UpdateSubmissionForm/UpdateSubmissionForm';

type Props = {
  submission: VariantUpdateSuggestion;
};

const EditUpdateSubmission: React.FC<Props> = ({ submission }) => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Change Update Submission"
        description="Changed your mind? Edit your update submission."
      />
      <UpdateSubmissionForm submission={submission} />
    </>
  );
};

export default EditUpdateSubmission;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csbUsername = await CookieService.get<Promise<string>>('csbUsername', { req: context.req, res: context.res });
  const csbJwt = await TokenService.getTokenFromServerContext(context);
  const submissionIdRaw = context.params?.id;
  if (!csbUsername || !csbJwt) {
    return {
      redirect: {
        destination: `/login?final=my-update-submissions/${submissionIdRaw}`,
        permanent: false,
      },
    };
  }
  if (typeof submissionIdRaw !== 'string') {
    return {
      redirect: {
        destination: '/my-update-submissions',
        permanent: false,
      },
    };
  }
  const submissionId = parseInt(submissionIdRaw, 10);
  if (isNaN(submissionId)) {
    return {
      redirect: {
        destination: '/my-update-submissions',
        permanent: false,
      },
    };
  }
  const configuration = apiConfiguration(context);
  const submissionsApi = new VariantUpdateSuggestionsApi(configuration);
  const submission = await submissionsApi.variantUpdateSuggestionsRetrieve({ id: submissionId });
  const { created: _, ...submissionWithoutCreated } = submission;
  return {
    props: {
      submission: submissionWithoutCreated,
    },
  };
};
