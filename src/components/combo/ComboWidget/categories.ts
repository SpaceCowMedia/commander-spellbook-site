import type { SpellbookIcon } from 'components/ui/Icon/Icon';
import type { Category } from 'lib/combo/widgets/shared/calculator';

/* How each kind of calculator introduces itself. */
export const CATEGORIES: Record<Category, { name: string; icon: SpellbookIcon }> = {
  'storm-life': { name: 'Storm life loop', icon: 'bolt' },
  lethal: { name: 'Lethal check', icon: 'explosion' },
  drain: { name: 'Drain loop', icon: 'droplet' },
  stats: { name: 'Power and counters', icon: 'fist' },
  board: { name: 'Board size', icon: 'hashtag' },
  finite: { name: 'Finite result', icon: 'trophy' },
  table: { name: 'Table size', icon: 'masks' },
  'commander-tax': { name: 'Commander tax', icon: 'commandZone' },
  chance: { name: 'Chance of success', icon: 'dice' },
};
