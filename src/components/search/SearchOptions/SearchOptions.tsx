import React from 'react';
import StyledSelect from 'components/layout/StyledSelect/StyledSelect';
import { ORDER_OPTIONS, SORT_OPTIONS } from 'lib/sorting';
import VariantGroupingSwitch from '../VariantGroupingSwitch/VariantGroupingSwitch';

export interface SearchOptionsProps {
  sort: string;
  order: string;
  groupByCombo: boolean;
  onSortChange: (sort: string) => unknown;
  onOrderChange: (order: string) => unknown;
  onGroupByComboChange: (groupByCombo: boolean) => unknown;
  // Tells the selects apart from those of other results on the same page.
  idPrefix?: string;
  // Follows the selects in the bar, like the buttons turning the pages.
  children?: React.ReactNode;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({
  sort,
  order,
  groupByCombo,
  onSortChange,
  onOrderChange,
  onGroupByComboChange,
  idPrefix = '',
  children,
}) => (
  <div className="border-b border-light">
    <div className="container sm:flex flex-row flex-wrap items-center justify-center">
      <div className="mr-2 sm:mt-0 mt-2" aria-hidden="true">
        Sorted by
      </div>
      <StyledSelect
        value={sort}
        id={`${idPrefix}sort-combos-select`}
        onChange={onSortChange}
        selectBackgroundClassName="border-dark border-2 my-2 sm:mr-2"
        label="Change how combos are sorted"
        options={SORT_OPTIONS}
      />
      <div className="mx-1 hidden sm:block" aria-hidden="true">
        :
      </div>
      <StyledSelect
        id={`${idPrefix}order-combos-select`}
        value={order}
        onChange={onOrderChange}
        selectBackgroundClassName="border-dark border-2 sm:m-2"
        label="Change sort direction, ascending or descending"
        options={ORDER_OPTIONS}
      />
      <VariantGroupingSwitch
        id={`${idPrefix}variant-grouping`}
        value={groupByCombo ? 'combo' : 'ungrouped'}
        onChange={(grouping) => onGroupByComboChange(grouping === 'combo')}
      />
      {children}
    </div>
  </div>
);

export default SearchOptions;
