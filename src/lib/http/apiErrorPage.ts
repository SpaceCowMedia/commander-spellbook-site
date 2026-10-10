import { GetServerSideProps } from 'next';
import { FetchError } from '@space-cow-media/spellbook-client';
import { httpErrorStatus, retryAfterSeconds } from './httpErrors';

export interface ApiErrorProps {
  apiError: {
    status: number;
    retryAfter: number | null;
  };
}

// When the API turns down the data a page is built from, the page answers with the same status and
// the matching error page takes its place (see `_app`), instead of a generic 500. Crawlers read the
// status, and `Retry-After` on a 429, and come back later rather than indexing the error.
// A client-side navigation receiving an error status falls back to a full page load, which ends up here too.
export function withApiErrorPage(getServerSideProps: GetServerSideProps): GetServerSideProps {
  return async (context) => {
    try {
      return await getServerSideProps(context);
    } catch (error) {
      // The API could not be reached at all
      const status = error instanceof FetchError ? 503 : httpErrorStatus(error);
      if (status === undefined || status < 400) {
        throw error;
      }
      if (status === 404) {
        return { notFound: true };
      }
      let retryAfter: number | null = null;
      if (status === 429) {
        retryAfter = retryAfterSeconds((error as { response?: Response }).response);
        context.res.setHeader('Retry-After', String(retryAfter));
      }
      context.res.statusCode = status;
      const props: ApiErrorProps = { apiError: { status, retryAfter } };
      return { props };
    }
  };
}
