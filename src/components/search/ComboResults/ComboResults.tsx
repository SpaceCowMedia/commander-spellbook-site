import styles from './comboResults.module.scss';
import ComboResult from '../ComboResult/ComboResult';
import ComboVariantGroup from '../ComboVariantGroup/ComboVariantGroup';
import { ClassifiedVariant, Deck, Variant, VariantPrices } from '@space-cow-media/spellbook-client';
import React, { useId, useMemo, useState } from 'react';
import PagedResults from '../PagedResults/PagedResults';
import { turnOwnPage } from 'lib/viewTransitions';
import countDeckCards from 'lib/countDeckCards';
import { groupVariantsByCombo, isOfCombo, VariantCategory, VariantGroup } from 'lib/variantGroups';

interface Props {
  deck?: Deck; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  results: Variant[] | ClassifiedVariant[];
  sort?: string;
  vendor?: (keyof VariantPrices)[];
  hideVariants?: boolean;
  localPageLimit?: number; // If passed in, will limit the number of results shown on the local page
  /* Groups the variants of each combo, those of the first category, shown along with the others of that combo. */
  groupVariants?: VariantCategory[];
  viewTransitionScope?: string;
}

const ComboResults: React.FC<Props> = ({
  results,
  sort,
  deck,
  hideVariants,
  decklistMessage,
  localPageLimit,
  groupVariants,
  viewTransitionScope,
}) => {
  const owner = useId();
  const grouped = groupVariants !== undefined;
  // Grouped otherwise, the variants make other pages, so the list starts over from the first one.
  const [pageOfGrouping, setPageOfGrouping] = useState({ page: 1, grouped });
  const page = pageOfGrouping.grouped === grouped ? pageOfGrouping.page : 1;
  const decklist = countDeckCards(deck);
  const items = useMemo<VariantGroup[]>(() => {
    const combos = results.map((result) => ('combo' in result ? result.combo : result));
    return grouped ? groupVariantsByCombo(combos) : combos.map((combo) => ({ variants: [combo] }));
  }, [grouped, results]);

  const handlePageChange = (newPage: number) =>
    turnOwnPage(owner, page, newPage, () => setPageOfGrouping({ page: newPage, grouped }));

  const hasMoreResults = localPageLimit ? page * localPageLimit < items.length : false;

  const localItems = localPageLimit ? items.slice((page - 1) * localPageLimit, page * localPageLimit) : items;

  const list = (
    <div className={styles.comboResultsWrapper}>
      {localItems.map(({ generator, variants }) =>
        groupVariants && variants.length > 1 ? (
          <ComboVariantGroup
            variants={variants}
            categories={groupVariants.map((category) => ({
              ...category,
              variants:
                category === groupVariants[0]
                  ? variants
                  : category.variants.filter((variant) => isOfCombo(variant, generator)),
            }))}
            deck={deck}
            viewTransitionScope={viewTransitionScope}
            key={variants[0].id}
          />
        ) : (
          <ComboResult
            combo={variants[0]}
            decklist={decklist}
            sort={sort}
            key={variants[0].id}
            hideVariants={hideVariants}
            decklistMessage={decklistMessage}
            viewTransitionScope={viewTransitionScope}
          />
        ),
      )}
    </div>
  );

  if (!localPageLimit) {
    return list;
  }

  return (
    <PagedResults
      id={`${owner}-pagination`}
      page={page}
      hasNextPage={hasMoreResults}
      owner={owner}
      onGoBack={() => handlePageChange(page - 1)}
      onGoForward={() => handlePageChange(page + 1)}
    >
      {list}
    </PagedResults>
  );
};

export default ComboResults;
