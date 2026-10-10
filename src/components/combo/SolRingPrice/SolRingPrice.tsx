import { CardPrices } from '@space-cow-media/spellbook-client';
import useSolRingPrice, { priceInSolRings, SOL_RING } from 'lib/combo/solRingPrice';
import pluralize from 'pluralize';
import React from 'react';

interface Props {
  price: string;
  store: keyof CardPrices;
  className?: string;
}

const SolRingPrice: React.FC<Props> = ({ price, store, className }) => {
  const solRings = Math.round((priceInSolRings(price, useSolRingPrice(store)) ?? 0) * 10) / 10;
  if (solRings <= 0) {
    return null;
  }

  return (
    <span className={className}>
      ≈ {solRings.toLocaleString('en-US')} {pluralize(SOL_RING, solRings)}
    </span>
  );
};

export default SolRingPrice;
