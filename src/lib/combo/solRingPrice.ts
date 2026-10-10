import { CardPrices, CardsApi } from '@space-cow-media/spellbook-client';
import { useEffect, useState } from 'react';
import useFoolsDay from 'lib/foolsDay';
import { apiConfiguration } from 'services/api.service';

export const SOL_RING = 'Sol Ring';

let solRingPrices: Promise<CardPrices | undefined> | undefined;

function fetchSolRingPrices(): Promise<CardPrices | undefined> {
  solRingPrices ??= new CardsApi(apiConfiguration())
    .cardsList({ q: SOL_RING, limit: 10 })
    .then((page) => page.results.find((card) => card.name === SOL_RING)?.prices)
    .catch(() => undefined);
  return solRingPrices;
}

// The price of a Sol Ring at the store, the unit everything is priced in on April Fools' Day. It is
// only fetched on that day, and stays unknown on every other.
export default function useSolRingPrice(store?: keyof CardPrices): number | undefined {
  const foolsDay = useFoolsDay();
  const [prices, setPrices] = useState<CardPrices>();

  useEffect(() => {
    if (foolsDay && store) {
      fetchSolRingPrices().then(setPrices);
    }
  }, [foolsDay, store]);

  return foolsDay && store && prices ? Number(prices[store]) : undefined;
}

// How many Sol Rings a price buys, unless either price is unknown.
export function priceInSolRings(price: string, solRingPrice: number | undefined): number | undefined {
  const solRings = Number(price) / (solRingPrice ?? NaN);
  return Number.isFinite(solRings) && solRings > 0 ? solRings : undefined;
}
