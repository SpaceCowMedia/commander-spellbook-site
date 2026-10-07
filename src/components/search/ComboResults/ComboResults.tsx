import styles from './comboResults.module.scss';
import ComboResult from '../ComboResult/ComboResult';
import { ClassifiedVariant, Deck, Variant, VariantPrices } from '@space-cow-media/spellbook-client';
import React, { addTransitionType, startTransition, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import PageTurn from 'components/layout/PageTurn/PageTurn';
import { pageTurn, pagesCanTurn, showTurningSheet } from 'lib/viewTransitions';

interface Props {
  deck?: Deck; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  results: Variant[] | ClassifiedVariant[];
  sort?: string;
  vendor?: (keyof VariantPrices)[];
  hideVariants?: boolean;
  localPageLimit?: number; // If passed in, will limit the number of results shown on the local page
}

const ComboResults: React.FC<Props> = ({ results, sort, deck, hideVariants, decklistMessage, localPageLimit }) => {
  const ref = useRef<HTMLDivElement>(null);
  const owner = useId();
  const [page, setPage] = useState(1);
  const decklist = deck?.main.concat(deck.commanders).reduce((acc, card) => {
    const lowercase = card.card.toLowerCase();
    acc.set(lowercase, (acc.get(lowercase) ?? 0) + card.quantity);
    return acc;
  }, new Map<string, number>());

  // Turns like the result pages of a search, from the top of the list rather than of the page.
  const handlePageChange = (newPage: number) => {
    ref.current?.scrollIntoView();
    if (pagesCanTurn()) {
      flushSync(() => showTurningSheet(owner));
    }
    startTransition(() => {
      addTransitionType(pageTurn(page, newPage));
      setPage(newPage);
    });
  };

  const hasMoreResults = localPageLimit ? page * localPageLimit < results.length : false;

  const localResults = localPageLimit ? results.slice((page - 1) * localPageLimit, page * localPageLimit) : results;

  const list = (
    <div className={styles.comboResultsWrapper}>
      {localResults.map((combo) => (
        <ComboResult
          combo={'combo' in combo ? combo.combo : combo}
          decklist={decklist}
          sort={sort}
          key={'combo' in combo ? combo.combo.id : combo.id}
          hideVariants={hideVariants}
          decklistMessage={decklistMessage}
        />
      ))}
    </div>
  );

  if (!localPageLimit) {
    return list;
  }

  return (
    <div ref={ref}>
      <PageTurn page={page} owner={owner}>
        {list}
      </PageTurn>
      <div className="w-full flex justify-center">
        {page > 1 && (
          <button className="button" onClick={() => handlePageChange(page - 1)}>
            View Previous
          </button>
        )}
        {hasMoreResults && (
          <button className="button" onClick={() => handlePageChange(page + 1)}>
            View More
          </button>
        )}
      </div>
    </div>
  );
};

export default ComboResults;
