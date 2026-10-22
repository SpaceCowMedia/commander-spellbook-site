import ComboResults from 'components/search/ComboResults/ComboResults';
import React, { addTransitionType, startTransition, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Decklist } from 'pages/find-my-combos';
import { CommanderCombos, ResultType } from 'lib/findMyCombosResultsCache';
import pluralize from 'pluralize';
import { Deck, Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import styles from './deckCombos.module.scss';
import { DEFAULT_ORDER, DEFAULT_SORT } from 'lib/constants';
import { toApiOrdering } from 'lib/sorting';
import countDeckCards from 'lib/countDeckCards';
import PagedResults from 'components/search/PagedResults/PagedResults';
import { SearchOptionsProps } from 'components/search/SearchOptions/SearchOptions';
import { RESORT, turnOwnPage } from 'lib/viewTransitions';
import { VariantCategory } from 'lib/variantGroups';
import useVariantGrouping from 'lib/useVariantGrouping';
import MissingCardClusters, { groupByMissingCard } from './MissingCardClusters/MissingCardClusters';
import VariantGroupingSwitch from 'components/search/VariantGroupingSwitch/VariantGroupingSwitch';
import { COMMANDER_COMBOS_PAGE_SIZE } from 'lib/commanderCombosQuery';
import { apiConfiguration } from 'services/api.service';
import { NewTabContext } from 'lib/newTab';

interface Props {
  currentlyParsedDeck?: Decklist;
  results: ResultType | undefined;
  commanderCombos?: CommanderCombos;
  query: string;
}

interface MissingCardSectionProps {
  id: string;
  title: string;
  description: string;
  /* The categories of the combos found, this section's first. */
  categories: VariantCategory[];
  deck?: Deck;
  deckCardCounts?: Map<string, number>;
}

const MISSING_ONE_CARD = 'missing one card';

const categorize = (results: ResultType) =>
  ({
    included: { label: 'in your deck', variants: results.included, inDeck: true },
    almostIncluded: { label: MISSING_ONE_CARD, variants: results.almostIncluded },
    almostIncludedByAddingColors: {
      label: MISSING_ONE_CARD,
      detail: 'with additional colors',
      variants: results.almostIncludedByAddingColors,
    },
    almostIncludedByChangingCommanders: {
      label: MISSING_ONE_CARD,
      detail: 'with a different commander',
      variants: results.almostIncludedByChangingCommanders,
    },
    almostIncludedByAddingColorsAndChangingCommanders: {
      label: MISSING_ONE_CARD,
      detail: 'with a different commander and additional colors',
      variants: results.almostIncludedByAddingColorsAndChangingCommanders,
    },
  }) satisfies Record<string, VariantCategory>;

const MissingCardSection: React.FC<MissingCardSectionProps> = ({
  id,
  title,
  description,
  categories,
  deck,
  deckCardCounts,
}) => {
  const [grouping, regroup] = useVariantGrouping('card');
  const viewTransitionScope = useId();
  const [{ variants: combos }] = categories;
  const groups = useMemo(() => groupByMissingCard(combos, deckCardCounts), [combos, deckCardCounts]);

  if (!combos.length) {
    return null;
  }
  const byCard = grouping === 'card' && groups.length > 0;

  return (
    <section id={id}>
      <h2 className="heading-subtitle">{title}</h2>
      <p>
        {description}{' '}
        {byCard && (
          <strong>
            Grouped into {groups.length} missing-card {pluralize('cluster', groups.length)}. Select one to inspect its
            variants.
          </strong>
        )}
      </p>
      <VariantGroupingSwitch
        id={`${id}-grouping`}
        value={grouping}
        onChange={regroup}
        groupings={['card', 'combo', 'ungrouped']}
      />
      {byCard ? (
        <MissingCardClusters
          groups={groups}
          categories={categories}
          deck={deck}
          viewTransitionScope={viewTransitionScope}
        />
      ) : (
        <ComboResults
          results={combos}
          deck={deck}
          sort={DEFAULT_SORT}
          hideVariants={true}
          localPageLimit={100}
          groupVariants={grouping === 'combo' ? categories : undefined}
          viewTransitionScope={viewTransitionScope}
        />
      )}
    </section>
  );
};

type ResultOptions = Pick<SearchOptionsProps, 'sort' | 'order' | 'groupByCombo'>;

interface CommanderListing {
  options: ResultOptions;
  // The first page comes with the lookup, the next ones only once turned to, and stay for turning back.
  pages: Variant[][];
  count: number;
}

const DEFAULT_COMMANDER_OPTIONS: ResultOptions = { sort: DEFAULT_SORT, order: DEFAULT_ORDER, groupByCombo: false };

const CommanderSection: React.FC<{ commanderCombos: CommanderCombos; deck?: Deck }> = ({ commanderCombos, deck }) => {
  const { query, combos, count } = commanderCombos;
  const numberOfCommanders = deck?.commanders.length ?? 1;
  const owner = useId();
  const [options, setOptions] = useState(DEFAULT_COMMANDER_OPTIONS);
  const [listing, setListing] = useState<CommanderListing>({
    options: DEFAULT_COMMANDER_OPTIONS,
    pages: [combos],
    count,
  });
  const [page, setPage] = useState(1);
  // Only the last request lands, so that a slow one can't turn back to options or pages left since.
  const lastRequest = useRef(0);
  const pageCount = Math.ceil(listing.count / COMMANDER_COMBOS_PAGE_SIZE);

  if (!combos.length) {
    return null;
  }

  const fetchPage = async (pageNumber: number, { sort, order, groupByCombo }: ResultOptions) => {
    const request = ++lastRequest.current;
    try {
      const results = await new VariantsApi(apiConfiguration()).variantsList({
        q: query,
        groupByCombo,
        limit: COMMANDER_COMBOS_PAGE_SIZE,
        offset: (pageNumber - 1) * COMMANDER_COMBOS_PAGE_SIZE,
        ordering: toApiOrdering(sort, order),
        count: pageNumber === 1,
      });
      return request === lastRequest.current ? results : undefined;
    } catch (error) {
      console.error('Failed to fetch the combos of the commanders', error);
      return undefined;
    }
  };

  const turnTo = async (newPage: number) => {
    let pages = listing.pages;
    if (!pages[newPage - 1]) {
      const fetched = await fetchPage(newPage, listing.options);
      if (!fetched) {
        return;
      }
      pages = [...pages, fetched.results];
    }
    turnOwnPage(owner, page, newPage, () => {
      setListing({ ...listing, pages });
      setPage(newPage);
    });
  };

  const changeOptions = async (changed: Partial<ResultOptions>) => {
    const newOptions = { ...options, ...changed };
    setOptions(newOptions);
    const fetched = await fetchPage(1, newOptions);
    if (!fetched) {
      return;
    }
    startTransition(() => {
      addTransitionType(RESORT);
      setListing({ options: newOptions, pages: [fetched.results], count: fetched.count ?? fetched.results.length });
      setPage(1);
    });
  };

  const searchParameters = new URLSearchParams({
    q: query,
    groupByCombo: String(listing.options.groupByCombo),
    sort: listing.options.sort,
    order: listing.options.order,
  });

  return (
    <section id="commander-combos-section">
      <h2 className="heading-subtitle">
        {listing.count} {pluralize('Combo', listing.count)} Found Using Your{' '}
        {pluralize('Commander', numberOfCommanders)}
      </h2>
      <p>
        List of the combos using {numberOfCommanders > 1 ? 'any of your commanders' : 'your commander'} within your
        color identity, however many combo pieces your decklist is missing.
      </p>
      <PagedResults
        id="commander-combos-pagination"
        page={page}
        hasNextPage={page < pageCount}
        owner={owner}
        options={{
          ...options,
          idPrefix: 'commander-',
          onSortChange: (sort) => changeOptions({ sort }),
          onOrderChange: (order) => changeOptions({ order }),
          onGroupByComboChange: (groupByCombo) => changeOptions({ groupByCombo }),
        }}
        onGoBack={() => turnTo(page - 1)}
        onGoForward={() => turnTo(page + 1)}
      >
        <ComboResults
          results={listing.pages[page - 1]}
          deck={deck}
          sort={listing.options.sort}
          hideVariants={!listing.options.groupByCombo}
        />
      </PagedResults>
      <Link href={`/search/?${searchParameters}`} className="button">
        Show all {listing.count} {pluralize('combo', listing.count)}
      </Link>
    </section>
  );
};

const DeckCombos = ({ results, commanderCombos, query, currentlyParsedDeck }: Props) => {
  const deckCardCounts = useMemo(() => countDeckCards(currentlyParsedDeck?.deck), [currentlyParsedDeck]);
  const categories = useMemo(() => results && categorize(results), [results]);
  const [includedGrouping, regroupIncluded] = useVariantGrouping('combo');
  const includedScope = useId();

  if (!results || !categories) {
    return (
      <div>
        <br />
        <h1 className="heading-subtitle">Loading Combos...</h1>
      </div>
    );
  }
  const numOfCombos = results.included.length;
  const combosInDeckHeadingText = !numOfCombos
    ? `No combos found${query.trim() ? ' for this filter query' : ''}`
    : `${numOfCombos} ${pluralize('Combo', numOfCombos)} Found`;

  const numPotentialCombos = results.almostIncluded.length;
  const potentialCombosInDeckHeadingText = `${numPotentialCombos} Potential ${pluralize(
    'Combo',
    numPotentialCombos,
  )} Found`;

  const potentialCombosInAdditionalColorsHeadingText = `${results.almostIncludedByAddingColors.length} Potential ${pluralize(
    'Combo',
    results.almostIncludedByAddingColors.length,
  )} Found With Additional Color Requirements`;

  return (
    // The combos open in a new tab, leaving the deck and what was found for it where they are.
    <NewTabContext value>
      <div className={`${styles.deckCombos} py-4`}>
        <section id="combos-in-deck-section">
          <h2 className="heading-subtitle">{combosInDeckHeadingText}</h2>
          {numOfCombos > 0 && (
            <VariantGroupingSwitch id="combos-in-deck-grouping" value={includedGrouping} onChange={regroupIncluded} />
          )}
          <ComboResults
            results={results.included}
            sort={DEFAULT_SORT}
            hideVariants={true}
            localPageLimit={100}
            groupVariants={includedGrouping === 'combo' ? [categories.included, categories.almostIncluded] : undefined}
            deck={currentlyParsedDeck?.deck}
            viewTransitionScope={includedScope}
          />
        </section>

        <MissingCardSection
          id="potential-combos-in-deck-section"
          title={potentialCombosInDeckHeadingText}
          description="List of combos where your decklist is missing 1 combo piece."
          categories={[categories.almostIncluded, categories.included]}
          deck={currentlyParsedDeck?.deck}
          deckCardCounts={deckCardCounts}
        />

        <MissingCardSection
          id="potential-combos-outside-color-identity-section"
          title={potentialCombosInAdditionalColorsHeadingText}
          description="List of combos where your decklist is missing 1 combo piece, but requires at least one additional color."
          categories={[
            categories.almostIncludedByAddingColors,
            categories.included,
            categories.almostIncluded,
            categories.almostIncludedByChangingCommanders,
            categories.almostIncludedByAddingColorsAndChangingCommanders,
          ]}
          deck={currentlyParsedDeck?.deck}
          deckCardCounts={deckCardCounts}
        />
        <MissingCardSection
          id="potential-combos-outside-commander-section"
          title={`${results.almostIncludedByChangingCommanders.length} Potential Combos Found With Different Commander`}
          description="List of combos where your decklist is missing 1 combo piece, but requires changing your commander."
          categories={[
            categories.almostIncludedByChangingCommanders,
            categories.included,
            categories.almostIncluded,
            categories.almostIncludedByAddingColors,
            categories.almostIncludedByAddingColorsAndChangingCommanders,
          ]}
          deck={currentlyParsedDeck?.deck}
          deckCardCounts={deckCardCounts}
        />
        <MissingCardSection
          id="potential-combos-outside-color-identity-and-commander-section"
          title={`${results.almostIncludedByAddingColorsAndChangingCommanders.length} Potential Combos Found With Different Commander and Additional Colors`}
          description="List of combos where your decklist is missing 1 combo piece, but requires changing your commander and adding a color."
          categories={[
            categories.almostIncludedByAddingColorsAndChangingCommanders,
            categories.included,
            categories.almostIncluded,
            categories.almostIncludedByAddingColors,
            categories.almostIncludedByChangingCommanders,
          ]}
          deck={currentlyParsedDeck?.deck}
          deckCardCounts={deckCardCounts}
        />
        {commanderCombos && (
          <CommanderSection
            key={commanderCombos.query}
            commanderCombos={commanderCombos}
            deck={currentlyParsedDeck?.deck}
          />
        )}
      </div>
    </NewTabContext>
  );
};

export default DeckCombos;
