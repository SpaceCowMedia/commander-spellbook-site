import { Option } from 'components/layout/StyledSelect/StyledSelect';
import { DEFAULT_ORDERING } from './constants';

export const SORT_OPTIONS: Option[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'salt', label: 'Salt' },
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

export const ORDER_OPTIONS: Option[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

const AUTO_SORT_MAP: Record<string, '-'> = {
  popularity: '-',
  salt: '-',
  created: '-',
  updated: '-',
  variant_count: '-',
};

export function toApiOrdering(sort: string, order: string): string {
  const direction = order === 'auto' ? AUTO_SORT_MAP[sort] || '' : order === 'asc' ? '' : '-';
  return `${direction}${sort},${DEFAULT_ORDERING}`;
}
