import React, { useEffect, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SearchMessage from "../components/search/SearchMessage/SearchMessage";
import StyledSelect, {
  Option,
} from "../components/layout/StyledSelect/StyledSelect";
import { useRouter } from "next/router";
import search from "../lib/search";
import {BackendCombo, FormattedApiResponse, SearchResults, Variant} from "../lib/types";
import { DEFAULT_ORDER, DEFAULT_SORT, DEFAULT_VENDOR } from "../lib/constants";
import SearchPagination from "../components/search/SearchPagination/SearchPagination";
import ComboResults from "../components/search/ComboResults/ComboResults";
import NoCombosFound from "../components/layout/NoCombosFound/NoCombosFound";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {GetServerSideProps} from "next";
import {RequestService} from "../services/request.service";
import {PaginatedResponse} from "../types/api";
import {processBackendResponses} from "../lib/backend-processors";
import formatApiResponse from "../lib/format-api-response";
import {deserializeCombo, serializeCombo, SerializedCombo} from "../lib/serialize-combo";

type Props = {
  serializedCombos: SerializedCombo[]
  count: number
  page: number
};

export type SearchResultsState = Omit<SearchResults, "errors"> & {
  errors: string;
  page: number;
  maxNumberOfCombosPerPage: number;
};

const SORT_OPTIONS: Option[] = [
  { value: "popularity", label: "Popularity" },
  { value: "identity_count", label: "Color Identity" },
  { value: "price", label: "Price" },
  {
    value: "cards_count",
    label: "# of Cards",
  },
  {
    value: "prerequisite_count",
    label: "# of Prerequisites",
  },
  {
    value: "steps_count",
    label: "# of Steps",
  },
  {
    value: "results_count",
    label: "# of Results",
  },
  {
    value: "created",
    label: "Date Created",
  },
  {
    value: "updated",
    label: "Date Updated",
  }
];

const ORDER_OPTIONS: Option[] = [
  { value: "auto", label: "Auto" },
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const PAGE_SIZE = 50
const Search: React.FC<Props> = ({serializedCombos, count, page}: Props) => {

  const combos = serializedCombos.map(combo => deserializeCombo(combo))

  const router = useRouter();

  const sort = router.query.sort as string || DEFAULT_SORT;
  const order = router.query.order as string || DEFAULT_ORDER;


  const query = router.query.q;
  const parsedSearchQuery = (!query || typeof query !== "string") ? "" : query;


  const totalPages = Math.floor(count / PAGE_SIZE) + 1;

  const numberPage = Number(page) || 1
  const goForward = () => {
    router.push({ pathname: "/search/", query: { ...router.query, page: numberPage+1 } });
  };

  const goBack = () => {
    router.push({ pathname: "/search/", query: { ...router.query, page: numberPage-1 } });
  };

  const handleSortChange = (value: string) => {
    router.push({ pathname: "/search/", query: { ...router.query, sort: value, page: "1" } });
  };

  const handleOrderChange = (value: string) => {
    router.push({ pathname: "/search/", query: { ...router.query, order: value, page: "1" } });
  };

  const legalityMessage = (parsedSearchQuery.includes("legal:")) ? "" : " (legal:commander has been applied by default)"

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Search Results"
        description="Search results for all EDH combos matching your query."
      />
      <div>
        <h1 className="sr-only">Search Results</h1>

        <SearchMessage
          message={`Showing ${count} results for query "${parsedSearchQuery}"${legalityMessage}`}
          errors={''}
          currentPage={page}
          totalPages={1}
          totalResults={1}
          maxNumberOfCombosPerPage={1}
        />

        {combos.length > 0 && (
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
                selectTextClassName="text-dark"
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
                selectTextClassName="text-dark"
                label="Change sort direction, ascending or descending"
                options={ORDER_OPTIONS}
              />
              <div className="flex-grow" />
              <SearchPagination
                currentPage={numberPage}
                totalPages={totalPages}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
            </div>
          </div>
        )}

        <div className="container sm:flex flex-row">
          {combos.length > 0 ? (
            <div className="w-full">
              <ComboResults
                results={combos}
              />
              <SearchPagination
                currentPage={page}
                totalPages={totalPages}
                aria-hidden="true"
                onGoForward={goForward}
                onGoBack={goBack}
              />
            </div>
          ) : (
            <NoCombosFound  />
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Search;


export const getServerSideProps: GetServerSideProps = async (context) => {
  let query = `${context.query.q}`
  if (!query.includes('legal:')) query = `${query} legal:commander`

  const requestService = new RequestService(context)
  const order = context.query.order || DEFAULT_ORDER
  const sort = context.query.sort || DEFAULT_SORT
  const ordering = order === 'auto' ? sort : `${order === 'asc' ? '' : '-'}${sort}`
  const results = await requestService.get<PaginatedResponse<Variant>>(`https://backend.commanderspellbook.com/variants/?q=${query}&limit=${PAGE_SIZE}&offset=${((Number(context.query.page) || 1) - 1) * PAGE_SIZE}&ordering=${ordering}`)

  const backendCombos = results ? results.results : []
  const combos = formatApiResponse(processBackendResponses(backendCombos, {}))
  if (combos.length === 1) {
    return {
      redirect: {
        destination: `/combo/${combos[0].commanderSpellbookId}/?q=${context.query.q}`,
        permanent: false,
      }
    }
  }
  return {
    props: {
      serializedCombos: combos.map(combo => serializeCombo(combo)),
      count: results.count,
      page: context.query.page || 1,

    }
  }
}
