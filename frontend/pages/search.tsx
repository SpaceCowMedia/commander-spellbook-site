import React, {useEffect, useState} from "react"
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SearchMessage from "../components/search/SearchMessage/SearchMessage";
import StyledSelect, { Option } from "../components/layout/StyledSelect/StyledSelect";
import {useRouter} from "next/router";
import search from "../lib/search";
import {SearchResults} from "../lib/types";
import {DEFAULT_ORDER, DEFAULT_SORT, DEFAULT_VENDOR} from "../lib/constants";
import SearchPagination from "../components/search/SearchPagination/SearchPagination";
import ComboResults from "../components/search/ComboResults/ComboResults";
import NoCombosFound from "../components/layout/NoCombosFound/NoCombosFound";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

type Props = {}

export type SearchResultsState = Omit<SearchResults, 'errors'> & {errors: string, page: number, maxNumberOfCombosPerPage: number}

const SORT_OPTIONS: Option[] = [
  { value: "popularity", label: "Popularity" },
  { value: "colors", label: "Color Identity" },
  { value: "price", label: "Price" },
  {
    value: "cards",
    label: "# of Cards",
  },
  {
    value: "prerequisites",
    label: "# of Prerequisites",
  },
  {
    value: "steps",
    label: "# of Steps",
  },
];

const ORDER_OPTIONS: Option[] = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const Search: React.FC<Props> = ({}: Props) => {

  const [loaded, setLoaded] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const [results, setResults] = useState<SearchResultsState>({
    combos: [],
    message: '',
    errors: '',
    page: 1,
    vendor: DEFAULT_VENDOR,
    order: DEFAULT_ORDER,
    sort: DEFAULT_SORT,
    maxNumberOfCombosPerPage: 78,
  })
  const {combos, message, vendor, order, sort, page, maxNumberOfCombosPerPage} = results


  const router = useRouter()

  const parseSearchQuery = () => {
    const query = router.query.q

    if (!query || typeof  query !== 'string') return ''

    return query
  }

  const updateSearchResults = async (query: string) => {
    const newResults = await search(query)


    if (newResults.combos.length === 1) {
      setRedirecting(true)
      router.replace({
        pathname: `/combo/${newResults.combos[0].commanderSpellbookId}/`,
        query: { q: query },
      })
      return
    }
    setLoaded(true)
    setResults({
      ...newResults,
      page: 1,
      errors: newResults.errors.join(' '),
      maxNumberOfCombosPerPage: 78,
    })

  }

  useEffect(() => {
    setLoaded(false)
    updateSearchResults(parseSearchQuery())
  }, [router.query.q])


  const totalResults = combos.length;
  const totalPages = Math.floor(totalResults / maxNumberOfCombosPerPage) + 1;

  const startingPoint =
    page > totalPages ? (totalPages - 1) * maxNumberOfCombosPerPage : (page - 1) * maxNumberOfCombosPerPage;

  const paginatedResults = totalResults > maxNumberOfCombosPerPage ? combos.slice(startingPoint, startingPoint + maxNumberOfCombosPerPage) : combos;

  const firstResult = page * maxNumberOfCombosPerPage - maxNumberOfCombosPerPage + 1;
  const lastResult = Math.min(firstResult + maxNumberOfCombosPerPage - 1, totalResults);

  const goForward = () => {
    setResults({
      ...results,
      page: Math.min(page + 1, totalPages),
    });
  }

  const goBack = () => {
    setResults({ ...results, page: Math.max(page - 1, 1) });
  }

  const handleSortChange = (value: string) => {
    const query = String(router.query.q)
      .replace(/((\s)?sort(:|=)\w*|$)/, ` sort:${value}`)
      .trim();
    router.push({ pathname: "/search", query: { q: query, page: "1" } });
  }

  const handleOrderChange = (value: string) => {
    const query = String(router.query.q)
      .replace(/((\s)?order(:|=)\w*|$)/, ` order:${value}`)
      .trim();
    router.push({ pathname: "/search", query: { q: query, page: "1" } });
  }

  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: Search Results" description="Search results for all EDH combos matching your query."/>
      <div>
        <h1 className="sr-only">Search Results</h1>

        <SearchMessage message={results.message} errors={results.errors} currentPage={results.page} totalPages={1} totalResults={1} maxNumberOfCombosPerPage={1}/>

        {paginatedResults.length > 0 && (
          <div className="border-b border-light">
            <div className="container sm:flex flex-row items-center justify-center">
              <div className="mr-2 sm:mt-0 mt-2" aria-hidden="true">Sorted by</div>
              <StyledSelect value={sort} id="sort-combos-select" onChange={handleSortChange}
                            selectBackgroundClassName="border-dark border-2 my-2 sm:mr-2" selectTextClassName="text-dark"
                            label="Change how combos are sorted" options={SORT_OPTIONS} />
              <div className="mx-1 hidden sm:block" aria-hidden="true">:</div>
              <StyledSelect id="order-combos-select" value={order} onChange={handleOrderChange}
                            selectBackgroundClassName="border-dark border-2 sm:m-2" selectTextClassName="text-dark"
                            label="Change sort direction, ascending or descending" options={ORDER_OPTIONS} />
              <div className="flex-grow"/>
              <SearchPagination currentPage={page} totalPages={totalPages} aria-hidden="true" onGoForward={goForward} onGoBack={goBack} />
            </div>
          </div>
        )}


        <div className="container sm:flex flex-row">
          {paginatedResults.length > 0 ?( <div className="w-full">
            <ComboResults results={results}  paginatedResults={paginatedResults} />

            <SearchPagination currentPage={page} totalPages={totalPages} aria-hidden="true" onGoForward={goForward} onGoBack={goBack} />
          </div>) : <NoCombosFound loaded={false} />

          }


        </div>
      </div>
    </PageWrapper>
  )
}

export default Search
