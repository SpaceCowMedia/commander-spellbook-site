import React from 'react';
import styles from './manaSymbol.module.scss';
import MagicSymbol from 'components/symbols/MagicSymbol/MagicSymbol';
import { findCardSymbol } from 'lib/symbols/symbology';

interface Props {
  symbol: string;
  size?: 'medium' | 'small';
  ariaHidden?: boolean;
  className?: string;
}

const ManaSymbol: React.FC<Props> = ({ symbol, size = 'medium', ariaHidden, className }) => (
  <MagicSymbol
    symbol={findCardSymbol(symbol)!}
    className={`${styles.manaSymbol} ${styles[size]} ${className}`}
    ariaHidden={ariaHidden}
  />
);

export default ManaSymbol;
