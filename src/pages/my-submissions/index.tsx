import React from 'react';
import { VariantSuggestion, VariantSuggestionsApi } from '@spacecowmedia/spellbook-client';
import { useRouter } from 'next/router';
import NoCombosFound from 'components/layout/NoCombosFound/NoCombosFound';
import SearchPagination from 'components/search/SearchPagination/SearchPagination';
import styles from './my-submissions.module.scss';
import { GetServerSideProps } from 'next';
import CookieService from 'services/cookie.service';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/queryParameters';
import ComboSubmissionItem from 'components/submission/ComboSubmissionItem/ComboSubmissionItem';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';

const PAGE_SIZE = 20;

type Props = {
  submissions: VariantSuggestion[];
  count: number;
  page: number;
  error?: string;
};

const MySubmissions: React.FC<Props> = ({ submissions, count, page, error }: Props) => {
  const router = useRouter();
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const pageNumber = Number(page) || 1;

  const goForward = () => {
    router.push({ pathname: '/my-submissions', query: { page: pageNumber + 1 } });
  };

  const goBack = () => {
    router.push({ pathname: '/my-submissions', query: { page: pageNumber - 1 } });
  };

  return (
    <>
      <SpellbookHead title="Commander Spellbook: Combo Submissions" description="View your combo submissions." />
      <div>
        {error && <p className={styles.error}>{error}</p>}
        <div className="container sm:flex flex-row">
          {submissions.length === 0 ? (
            <NoCombosFound />
          ) : (
            <div className="w-full">
              <SearchPagination
                currentPage={pageNumber}
                totalPages={totalPages}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
              <div className={styles.suggestionsWrapper}>
                {submissions.map((suggestion) => (
                  <ComboSubmissionItem key={suggestion.id} submission={suggestion} />
                ))}
              </div>
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

export default MySubmissions;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = await CookieService.get<Promise<string>>('csbUserId', { req: context.req, res: context.res });
  if (!userId) {
    return {
      redirect: {
        destination: '/login?final=my-submissions',
        permanent: false,
      },
    };
  }
  const configuration = apiConfiguration(context);
  const suggestionsApi = new VariantSuggestionsApi(configuration);
  try {
    const results = await suggestionsApi.variantSuggestionsList({
      suggestedBy: Number(userId),
      limit: PAGE_SIZE,
      offset: ((Number(queryParameterAsString(context.query.page)) || 1) - 1) * PAGE_SIZE,
    });

    return {
      props: {
        submissions: results.results,
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
