import React from 'react';
import SearchMessage from '../components/search/SearchMessage/SearchMessage';
import StyledSelect, { Option } from '../components/layout/StyledSelect/StyledSelect';
import { useRouter } from 'next/router';
import { DEFAULT_ORDER, DEFAULT_ORDERING, DEFAULT_SORT } from '../lib/constants';
import SearchPagination from '../components/search/SearchPagination/SearchPagination';
import ComboResults from '../components/search/ComboResults/ComboResults';
import NoCombosFound from '../components/layout/NoCombosFound/NoCombosFound';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { GetServerSideProps } from 'next';
import ArtCircle from 'components/layout/ArtCircle/ArtCircle';
import { ExplainQueryApi, PropertiesApi, Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/queryParameters';
import rewriteRenamedResults from 'lib/renamedResults';
import normalizeQuotes from 'lib/normalizeQuotes';

const PAGE_SIZE = 50;

interface Props {
  combos: Variant[];
  bannedCombos?: Variant[];
  page: number;
  error?: string;
  featured?: string;
  explanation?: string | null;
}

const SORT_OPTIONS: Option[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'identity_count', label: 'Color Identity' },
  { value: 'price_tcgplayer', label: 'Price (TCGPlayer)' },
  { value: 'price_cardkingdom', label: 'Price (CardKingdom)' },
  { value: 'price_cardmarket', label: 'Price (Cardmarket)' },
  { value: 'variant_count', label: '# of Variants' },
  {
    value: 'card_count',
    label: '# of Cards',
  },
  {
    value: 'result_count',
    label: '# of Results',
  },
  {
    value: 'created',
    label: 'Date Created',
  },
  {
    value: 'updated',
    label: 'Date Updated',
  },
];

const ORDER_OPTIONS: Option[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

const AUTO_SORT_MAP: Record<string, '-'> = {
  popularity: '-',
  created: '-',
  updated: '-',
  variant_count: '-',
};

// The keywords that constrain the format a combo is playable in. They only accept the `:` operator.
const LEGALITY_KEYWORDS = ['legal', 'banned', 'format'];

// A value in double quotes can contain anything, including something that reads like a legality
// term, so quoted spans are blanked out before looking for one. Escaped quotes stay inside a value.
const QUOTED_VALUE = /"(?:\\.|[^"\\])*"/g;

// Keywords are case insensitive, and a term can only start at the beginning of the query or after
// whitespace, a parenthesis, a boolean operator alias or the `-` negation prefix. Anchoring the
// match that way avoids mistaking the tail of another term, such as `oracle:illegal:`, for one.
const LEGALITY_TERM = new RegExp(String.raw`(?:^|[\s()&|-])(?:${LEGALITY_KEYWORDS.join('|')}):`, 'i');

const doesQuerySpecifyFormat = (query: string): boolean => {
  return LEGALITY_TERM.test(query.replaceAll(QUOTED_VALUE, '""'));
};

// The explanation endpoint rejects invalid queries the same way the search endpoint does, so a
// failure here always comes with an error message from the search itself: fall back to null and
// let the page describe the query on its own.
const explainQuery = async (explainQueryApi: ExplainQueryApi, query: string): Promise<string | null> => {
  try {
    const explanation = await explainQueryApi.explainQueryRetrieve({ q: query });
    return explanation.explanation;
  } catch {
    return null;
  }
};

const Search: React.FC<Props> = ({ combos, page, bannedCombos, error, featured, explanation }) => {
  const router = useRouter();

  const sort = queryParameterAsString(router.query.sort) || DEFAULT_SORT;
  const order = queryParameterAsString(router.query.order) || DEFAULT_ORDER;

  const query = queryParameterAsString(router.query.q) || '';

  const variant = queryParameterAsString(router.query.variant);

  const groupBy = queryParameterAsString(router.query.groupByCombo) !== 'false';

  const pageNumber = Number(page) || 1;

  const goForward = () => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, page: pageNumber + 1 },
    });
  };

  const goBack = () => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, page: pageNumber - 1 },
    });
  };

  const handleSortChange = (value: string) => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, sort: value, page: '1' },
    });
  };

  const handleOrderChange = (value: string) => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, order: value, page: '1' },
    });
  };

  const handleGroupByComboChange = (value: string) => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, groupByCombo: value, page: '1' },
    });
  };

  const handleClearVariant = () => {
    router.push({
      pathname: '/search/',
      query: { ...router.query, variant: undefined, page: '1' },
    });
  };

  // The explanation is fetched for the query that actually ran, so it mentions the default legality
  // filter on its own. Only the fallback below has to spell it out, and never when listing the
  // variants of a combo, which skips the filter entirely.
  const legalityMessage =
    doesQuerySpecifyFormat(query) || variant ? '' : ' (legal:commander has been applied by default)';

  const singleCardQuery = /^card="([^"]+)"$/.exec(query);

  const queryDescription =
    explanation ||
    (singleCardQuery
      ? `Showing combos with the card "${singleCardQuery[1]}".${legalityMessage}`
      : `Showing results for query "${query}".${legalityMessage}`);

  const searchMessage =
    queryDescription + (variant ? ` Only variants of the combo with ID "${variant}" are shown.` : '');

  const hasNextPage = combos.length === PAGE_SIZE;
  const hasResults = combos.length > 0;
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Search Results"
        description="Search results for all EDH combos matching your query."
      />
      <div>
        {featured !== null && featured !== undefined ? (
          <>
            <ArtCircle cardName="Thespian's Stage" className="m-auto md:block hidden my-8" />
            <h1 className="heading-title">Featured Combos</h1>
            {featured && <h2 className="heading-subtitle">{featured}</h2>}
          </>
        ) : (
          <>
            {singleCardQuery ? (
              <h1 className="heading-title">Combos with "{singleCardQuery[1]}"</h1>
            ) : (
              <h1 className="sr-only">Search Results</h1>
            )}
            <SearchMessage
              message={error ? '' : searchMessage}
              errors={error ?? ''}
              currentPage={page}
              totalPages={1}
              totalResults={1}
              maxNumberOfCombosPerPage={1}
            />
          </>
        )}

        {hasResults && (
          <div className="border-b border-light">
            <div className="container sm:flex flex-row items-center justify-center">
              <div className="mr-2 sm:mt-0 mt-2" aria-hidden="true">
                Sorted by
              </div>
              <StyledSelect
                value={sort}
                id="sort-combos-select"
                onChange={handleSortChange}
                selectBackgroundClassName="border-dark border-2 my-2 sm:mr-2"
                label="Change how combos are sorted"
                options={SORT_OPTIONS}
              />
              <div className="mx-1 hidden sm:block" aria-hidden="true">
                :
              </div>
              <StyledSelect
                id="order-combos-select"
                value={order}
                onChange={handleOrderChange}
                selectBackgroundClassName="border-dark border-2 sm:m-2"
                label="Change sort direction, ascending or descending"
                options={ORDER_OPTIONS}
              />
              <div className="mr-2 sm:mt-0 mt-2" aria-hidden="true">
                Variants grouped by combo
              </div>
              <StyledSelect
                id="group-by-combo-select"
                value={groupBy ? 'true' : 'false'}
                onChange={handleGroupByComboChange}
                selectBackgroundClassName="border-dark border-2 my-2 sm:mr-2"
                label="Group variants by combo"
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
              {variant && (
                <button onClick={handleClearVariant} className="">
                  Clear Variant Filter
                </button>
              )}
              <div className="grow min-h-2" />
              <SearchPagination
                currentPage={pageNumber}
                hasNextPage={hasNextPage}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
            </div>
          </div>
        )}

        <div className="container sm:flex flex-row">
          {hasResults ? (
            <div className="w-full">
              <ComboResults results={combos} sort={sort} hideVariants={!groupBy} />
              <SearchPagination
                currentPage={pageNumber}
                hasNextPage={hasNextPage}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
            </div>
          ) : featured ? (
            <div>
              <p>No featured combos at this time!</p>
            </div>
          ) : (
            <NoCombosFound alternatives={bannedCombos} criteria="banned" />
          )}
        </div>
      </div>
    </>
  );
};

export default Search;

interface ErrorWithResponse extends Error {
  response: Response;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const configuration = apiConfiguration(context);
  // Inputs are already sanitized as they are typed, but a query can also arrive from an old link or
  // from outside the site, so the same folding is applied here.
  let query = normalizeQuotes(queryParameterAsString(context.query.q) ?? '');
  console.log('Search query:', query);

  // Renamed results are resolved before anything else, so an old link lands on the current query
  // rather than on an empty result set. Redirecting instead of rewriting silently keeps the new
  // name visible in the URL and in the search bar, ready to be edited.
  const queryWithRenamedResults = rewriteRenamedResults(query);
  if (queryWithRenamedResults !== query) {
    const parameters = new URLSearchParams({ q: queryWithRenamedResults });
    for (const [key, value] of Object.entries(context.query)) {
      if (key === 'q' || value === undefined) {
        continue;
      }
      for (const entry of Array.isArray(value) ? value : [value]) {
        parameters.append(key, entry);
      }
    }
    return {
      redirect: {
        destination: `/search/?${parameters}`,
        permanent: false,
      },
    };
  }

  let featured: string | null = null;
  const featuredMatch = query.match(/^is:featured(?:-(\d+))?$/);
  if (featuredMatch) {
    const featuredNumber = featuredMatch[1] ? Number(featuredMatch[1]) : null;
    if (featuredNumber) {
      const propertiesApi = new PropertiesApi(configuration);
      const res = await propertiesApi.propertiesList();
      const property = res.results.find((data) => data.key === `featured_combos_title_${featuredNumber}`);
      if (property && property.value) {
        featured = property.value;
      }
    } else {
      featured = '';
    }
  }
  const isQueryMissingFormat = !doesQuerySpecifyFormat(query);
  const variant = queryParameterAsString(context.query.variant);
  if (isQueryMissingFormat && !variant) {
    // `AND` binds more tightly than `OR`, so the default filter has to be applied to the query as a
    // whole: appending it bare would turn `a OR b` into `a OR (b AND legal:commander)`.
    query = query.trim() ? `(${query}) legal:commander` : 'legal:commander';
  }
  const order = queryParameterAsString(context.query.order) || DEFAULT_ORDER;
  const sort = queryParameterAsString(context.query.sort) || DEFAULT_SORT;
  const ordering =
    (order === 'auto' ? `${AUTO_SORT_MAP[sort as string] || ''}${sort}` : `${order === 'asc' ? '' : '-'}${sort}`) +
    `,${DEFAULT_ORDERING}`;
  const groupByCombo = queryParameterAsString(context.query.groupByCombo)?.toLowerCase() !== 'false';
  const variantsApi = new VariantsApi(configuration);
  const explanationPromise = explainQuery(new ExplainQueryApi(configuration), query);
  try {
    const results = await variantsApi.variantsList({
      q: query,
      groupByCombo: groupByCombo,
      variant: variant,
      limit: PAGE_SIZE,
      offset: ((Number(queryParameterAsString(context.query.page)) || 1) - 1) * PAGE_SIZE,
      ordering: ordering,
    });

    const backendCombos = results.results;

    if (backendCombos.length === 0 && isQueryMissingFormat) {
      // Try searching in banned combos
      query = query.replaceAll('legal:', 'banned:');
      const results = await variantsApi.variantsList({
        q: query,
        groupByCombo: groupByCombo,
        variant: variant,
        limit: PAGE_SIZE,
        ordering: ordering,
      });
      const bannedCombos = results ? results.results : [];
      if (bannedCombos.length > 0) {
        return {
          props: {
            combos: [],
            bannedCombos: bannedCombos,
            page: context.query.page || 1,
            explanation: await explanationPromise,
          },
        };
      }
    }

    if (backendCombos.length === 1 && (context.query.page || '1') === '1') {
      return {
        redirect: {
          destination: `/combo/${backendCombos[0].id}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        combos: backendCombos,
        featured,
        page: context.query.page || 1,
        explanation: await explanationPromise,
      },
    };
  } catch (error) {
    let e = error as { q?: string } | ErrorWithResponse;
    if ('response' in e) {
      e = (await e.response.json()) as { q?: string };
    }
    e = e as { q?: string };
    const error_message = e.q
      ? Array.isArray(e.q)
        ? e.q.join('. ')
        : e.q
      : 'An error occurred while searching for combos.';
    return {
      props: {
        combos: [],
        page: context.query.page || 1,
        error: error_message,
      },
    };
  }
};
