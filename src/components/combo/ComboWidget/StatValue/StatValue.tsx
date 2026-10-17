import React from 'react';
import ManaAmount from 'components/symbols/ManaAmount/ManaAmount';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import type { Stat } from 'lib/combo/widgets/shared/calculator';

const StatValue: React.FC<{ stat: Stat }> = ({ stat }) =>
  stat.mana ? <ManaAmount cost={stat.mana} /> : <TextWithMagicSymbol text={stat.value} />;

export default StatValue;
