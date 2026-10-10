import React from 'react';
import MagicSymbol from 'components/symbols/MagicSymbol/MagicSymbol';
import GenericMana from 'components/symbols/GenericMana/GenericMana';
import { ManaCost, manaRuns } from 'lib/symbols/mana';
import { findCardSymbol } from 'lib/symbols/symbology';
import styles from './manaAmount.module.scss';

interface Props {
  cost: ManaCost;
}

const Glyph: React.FC<{ symbol: string }> = ({ symbol }) => {
  const card = findCardSymbol(symbol);
  if (card) {
    return <MagicSymbol symbol={card} className={styles.symbol} />;
  }
  if (/^\d+$/.test(symbol)) {
    return <GenericMana amount={Number(symbol)} />;
  }
  return <span>{`{${symbol}}`}</span>;
};

/* A cost of any size: official symbols where they exist, a generic mana symbol of our own for
   amounts like {1,234} that have none, and runs like {G} × 1,000,000 that are too long to draw one
   by one. */
const ManaAmount: React.FC<Props> = ({ cost }) => (
  <span className={styles.amount}>
    {manaRuns(cost).map(({ symbol, count }, i) =>
      count === 1 ? (
        <Glyph key={i} symbol={symbol} />
      ) : (
        <span key={i} className={styles.run}>
          <Glyph symbol={symbol} />
          <span className={styles.times}>× {count.toLocaleString('en-US')}</span>
        </span>
      ),
    )}
  </span>
);

export default ManaAmount;
