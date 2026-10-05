import React, { useRef, useState } from 'react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { CardDetail, Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import ComboResults from 'components/search/ComboResults/ComboResults';
import StyledSelect from 'components/layout/StyledSelect/StyledSelect';
import Loader from 'components/layout/Loader/Loader';
import { apiConfiguration } from 'services/api.service';
import { cardComboQuery, commanderFormatTerm, variantSearchPath } from 'lib/cards';
import { DEFAULT_ORDER, DEFAULT_SORT } from 'lib/constants';
import { ORDER_OPTIONS, SORT_OPTIONS, toApiOrdering } from 'lib/sorting';
import { formatCount } from 'lib/seo';
import sections from '../cardSections.module.scss';
import styles from './cardComboExplorer.module.scss';

interface Props {
  card: CardDetail;
  formatTerm: string;
  combosCount: number;
  initialCombos: Variant[];
}

const PAGE_SIZE = 20;

const CardComboExplorer: React.FC<Props> = ({ card, formatTerm, combosCount, initialCombos }) => {
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [combos, setCombos] = useState(initialCombos);
  const [hasMore, setHasMore] = useState(combosCount > initialCombos.length);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const latestRequest = useRef(0);
  const query = cardComboQuery(card, formatTerm);
  const combosLabel = `${formatCount(combosCount)} ${pluralize('combo', combosCount)}`;

  const load = async (newSort: string, newOrder: string, offset: number) => {
    const request = ++latestRequest.current;
    setLoading(true);
    setFailed(false);
    try {
      const page = await new VariantsApi(apiConfiguration()).variantsList({
        q: query,
        groupByCombo: false,
        ordering: toApiOrdering(newSort, newOrder),
        limit: PAGE_SIZE,
        offset,
      });
      if (request !== latestRequest.current) {
        return;
      }
      setCombos((previous) => (offset === 0 ? page.results : [...previous, ...page.results]));
      setHasMore(page.next !== null);
    } catch (error) {
      console.error('Error fetching the combos of the card', error);
      if (request === latestRequest.current) {
        setFailed(true);
      }
    } finally {
      if (request === latestRequest.current) {
        setLoading(false);
      }
    }
  };

  const selectSort = (value: string) => {
    setSort(value);
    setCombos([]);
    load(value, order, 0);
  };

  const selectOrder = (value: string) => {
    setOrder(value);
    setCombos([]);
    load(sort, value, 0);
  };

  return (
    <section id="card-combos" className={sections.section}>
      <h2 className={sections.sectionTitle}>Combos with {card.name}</h2>
      <p className={sections.sectionNote}>
        {combosLabel} {formatTerm === commanderFormatTerm(true) ? 'legal' : 'not legal'} in Commander.
      </p>
      <div className={styles.sorting}>
        <span aria-hidden="true">Sorted by</span>
        <span title="Choose what the combos are sorted by">
          <StyledSelect
            id="card-combos-sort"
            value={sort}
            onChange={selectSort}
            selectBackgroundClassName="border-dark border-2"
            label="Change how combos are sorted"
            options={SORT_OPTIONS}
          />
        </span>
        <span title="Switch between ascending and descending order">
          <StyledSelect
            id="card-combos-order"
            value={order}
            onChange={selectOrder}
            selectBackgroundClassName="border-dark border-2"
            label="Change sort direction, ascending or descending"
            options={ORDER_OPTIONS}
          />
        </span>
      </div>
      <div aria-live="polite" aria-busy={loading}>
        <ComboResults results={combos} sort={sort} hideVariants />
        {failed && <p className="text-center text-danger">The combos could not be loaded, please try again.</p>}
      </div>
      <div className={styles.footer}>
        {loading && <Loader />}
        {!loading && hasMore && (
          <button
            type="button"
            className="button"
            onClick={() => load(sort, order, combos.length)}
            title={`Show the next ${PAGE_SIZE} combos here`}
          >
            Load more
          </button>
        )}
        <Link
          className="button"
          href={variantSearchPath(query, { sort, order })}
          aria-label={`Open all ${combosLabel} in the search`}
          title={`Open all ${combosLabel} in the search page, to refine them with more filters`}
        >
          Open in search
        </Link>
      </div>
    </section>
  );
};

export default CardComboExplorer;
