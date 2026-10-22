import React, { useRef } from 'react';
import PageTurn from 'components/layout/PageTurn/PageTurn';
import SearchPagination from '../SearchPagination/SearchPagination';
import SearchOptions, { SearchOptionsProps } from '../SearchOptions/SearchOptions';

interface Props {
  id: string;
  page: number;
  hasNextPage: boolean;
  // Tells these results apart from others on the same page that turn on their own.
  owner?: string;
  // The bar of the search, which then holds the top buttons.
  options?: Omit<SearchOptionsProps, 'children'>;
  onGoBack: () => unknown;
  onGoForward: () => unknown;
  children: React.ReactNode;
}

// Results turned page by page in place, with the buttons of the search above and below them.
const PagedResults: React.FC<Props> = ({ id, page, hasNextPage, owner, options, onGoBack, onGoForward, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  // The top buttons are in view already, the bottom ones bring the top of the results back into it.
  const fromTop = (go: () => unknown) => () => {
    ref.current?.scrollIntoView();
    return go();
  };
  const pagination = (position: string, goBack: () => unknown, goForward: () => unknown) =>
    (page > 1 || hasNextPage) && (
      <SearchPagination
        id={`${position}-${id}`}
        currentPage={page}
        hasNextPage={hasNextPage}
        onGoBack={goBack}
        onGoForward={goForward}
      />
    );
  const topPagination = pagination('top', onGoBack, onGoForward);

  return (
    <div ref={ref} className="w-full">
      {options ? (
        <SearchOptions {...options}>
          {/* Keeps the buttons on the right, on the row of the options or wrapped on one of their own. */}
          <div className="flex grow justify-end min-h-2">{topPagination}</div>
        </SearchOptions>
      ) : (
        topPagination
      )}
      <PageTurn page={page} owner={owner}>
        {children}
      </PageTurn>
      {pagination('bottom', fromTop(onGoBack), fromTop(onGoForward))}
    </div>
  );
};

export default PagedResults;
