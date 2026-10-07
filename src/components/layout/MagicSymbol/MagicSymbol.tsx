import React from 'react';
import { CardSymbol, getCardSymbolUrl } from 'lib/symbology';

interface Props {
  symbol: CardSymbol;
  className?: string;
  ariaHidden?: boolean;
}

const MagicSymbol: React.FC<Props> = ({ symbol, className, ariaHidden }) => (
  <img src={getCardSymbolUrl(symbol)} alt={symbol.english} className={className} aria-hidden={ariaHidden} />
);

export default MagicSymbol;
