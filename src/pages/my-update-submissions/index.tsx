import React from 'react';
import { VariantUpdateSuggestionsApi } from '@space-cow-media/spellbook-client';
import { useRouter } from 'next/router';
import SearchPagination from 'components/search/SearchPagination/SearchPagination';
import styles from './my-update-submissions.module.scss';
import { GetServerSideProps } from 'next';
import CookieService from 'services/cookie.service';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/queryParameters';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';
import TokenService from 'services/token.service';
import {
  UpdateSubmission,
  variantUpdateSuggestionFromSubmission,
  variantUpdateSuggestionToSubmission,
} from 'lib/types';
import UpdateSubmissionItem from 'components/submission/UpdateSubmissionItem/UpdateSubmissionItem';
import SplashPage from 'components/layout/SplashPage/SplashPage';
import Link from 'next/link';

const PAGE_SIZE = 20;

type Props = {
  submissions: UpdateSubmission[];
  count: number;
  page: number;
  error?: string;
};

const MyUpdateSubmissions: React.FC<Props> = ({ submissions, count, page, error }: Props) => {
  const router = useRouter();
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const pageNumber = Number(page) || 1;

  const goForward = () => {
    router.push({ pathname: '/my-update-submissions', query: { page: pageNumber + 1 } });
  };

  const goBack = () => {
    router.push({ pathname: '/my-update-submissions', query: { page: pageNumber - 1 } });
  };

  return (
    <>
      <SpellbookHead title="Commander Spellbook: Update Submissions" description="View your update submissions." />
      <div>
        {error && <p className={styles.error}>{error}</p>}
        <div className="container sm:flex flex-row">
          {submissions.length === 0 ? (
            <SplashPage
              pulse={false}
              title="No Update Submissions Found"
              flavor={"No, it's not quite as simple as 'point and boom,' but if you must summarize."}
              artCircleCardName="Frantic Search"
            >
              <div className={`${styles.noCombosFoundButtons} opacity-100`}>
                <h2 className="heading-subtitle">You don't have any update submission to see yet.</h2>
                <div>
                  <Link href="/submit-an-update">
                    <button className="button">Submit one</button>
                  </Link>
                </div>
              </div>
            </SplashPage>
          ) : (
            <div className="w-full">
              <SearchPagination
                currentPage={pageNumber}
                totalPages={totalPages}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
              <ul className={styles.suggestionsWrapper}>
                {submissions.map((suggestion) => (
                  <UpdateSubmissionItem
                    key={suggestion.id}
                    submission={variantUpdateSuggestionFromSubmission(suggestion)}
                  />
                ))}
              </ul>
              <SearchPagination
                currentPage={pageNumber}
                totalPages={totalPages}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyUpdateSubmissions;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = await CookieService.get<Promise<string>>('csbUserId', { req: context.req, res: context.res });
  const csbJwt = await TokenService.getTokenFromServerContext(context);
  if (!userId || !csbJwt) {
    return {
      redirect: {
        destination: '/login?final=my-update-submissions',
        permanent: false,
      },
    };
  }
  const configuration = apiConfiguration(context);
  const suggestionsApi = new VariantUpdateSuggestionsApi(configuration);
  try {
    const results = await suggestionsApi.variantUpdateSuggestionsList({
      suggestedBy: Number(userId),
      limit: PAGE_SIZE,
      offset: ((Number(queryParameterAsString(context.query.page)) || 1) - 1) * PAGE_SIZE,
    });

    return {
      props: {
        submissions: results.results.map(variantUpdateSuggestionToSubmission),
        count: results.count,
        page: context.query.page || 1,
      },
    };
  } catch {
    return {
      props: {
        submissions: [],
        count: 0,
        page: context.query.page || 1,
        error: 'An error occurred while fetching your submissions.',
      },
    };
  }
};
