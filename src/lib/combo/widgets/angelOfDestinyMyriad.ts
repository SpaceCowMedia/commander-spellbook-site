import { OPPONENTS } from './shared/inputs';
import { angelOfDestinyWidget } from './angelOfDestiny';

export const angelOfDestinyMyriad = angelOfDestinyWidget('angel-of-destiny-myriad', {
  summary:
    'Myriad gives one attacking Angel per opponent, and every Angel triggers on every hit: with N opponents you gain 4 × N² life.',
  input: OPPONENTS,
  gained: (values) => 4 * values.numbers.opponents ** 2,
  myriad: true,
});
