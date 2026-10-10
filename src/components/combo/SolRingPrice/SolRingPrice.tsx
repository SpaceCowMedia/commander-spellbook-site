import { CardPrices, CardsApi } from '@space-cow-media/spellbook-client';
import useFoolsDay from 'lib/foolsDay';
import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';
import { apiConfiguration } from 'services/api.service';

const SOL_RING = 'Sol Ring';

let solRingPrices: Promise<CardPrices | undefined> | undefined;

function fetchSolRingPrices(): Promise<CardPrices | undefined> {
  solRingPrices ??= new CardsApi(apiConfiguration())
    .cardsList({ q: SOL_RING, limit: 10 })
    .then((page) => page.results.find((card) => card.name === SOL_RING)?.prices)
    .catch(() => undefined);
  return solRingPrices;
}

interface Props {
  price: string;
  store: keyof CardPrices;
  className?: string;
}

const SolRingPrice: React.FC<Props> = ({ price, store, className }) => {
  const foolsDay = useFoolsDay();
  const [solRingPrice, setSolRingPrice] = useState<number>();

  useEffect(() => {
    if (foolsDay) {
      fetchSolRingPrices().then((prices) => setSolRingPrice(prices ? Number(prices[store]) : undefined));
    }
  }, [foolsDay, store]);

  const solRings = Math.round((Number(price) / (solRingPrice ?? NaN)) * 10) / 10;
  if (!foolsDay || !Number.isFinite(solRings) || solRings <= 0) {
    return null;
  }

  return (
    <span className={className}>
      ≈ {solRings.toLocaleString('en-US')} {pluralize(SOL_RING, solRings)}
    </span>
  );
};

export default SolRingPrice;
