import type { SpellbookIcon } from 'components/ui/Icon/Icon';
import type { Tone } from 'lib/tone';
import styles from './tones.module.scss';

/* Every tone comes with an icon and a word, never as color alone. Its class sets the --tone
   variables that components paint themselves with. */
export const TONES: Record<Tone, { icon: SpellbookIcon; word: string; className: string }> = {
  good: { icon: 'complete', word: 'good', className: styles.good },
  bad: { icon: 'circleXmark', word: 'bad', className: styles.bad },
  warn: { icon: 'triangleExclamation', word: 'risky', className: styles.warn },
  neutral: { icon: 'circleInfo', word: '', className: styles.neutral },
};
