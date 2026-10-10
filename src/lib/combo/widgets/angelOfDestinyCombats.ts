import { numberInput } from './shared/inputs';
import { angelOfDestinyWidget } from './angelOfDestiny';

export const angelOfDestinyCombats = angelOfDestinyWidget('angel-of-destiny-combats', {
  summary: 'Each combat Angel of Destiny deals 2 + 2 damage and you gain 4 life.',
  input: numberInput('combats', 'Combats with Angel of Destiny', 3, { min: 1 }),
  gained: (values) => 4 * values.numbers.combats,
  myriad: false,
});
