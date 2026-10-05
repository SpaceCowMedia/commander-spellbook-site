import { Variant } from '@space-cow-media/spellbook-client';
import { streamJsonArray } from 'lib/jsonArrayStream';
import { cachedLoader } from 'lib/cachedLoader';

const ID_MAP_URL = 'https://json.commanderspellbook.com/variant_id_map.json';
const VARIANTS_URL = 'https://json.commanderspellbook.com/variants.json.gz';
const BULK_IDS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 6;

export interface BulkIds {
  variantIds: string[];
  cardIds: number[];
}

const fetchLegacyMap = cachedLoader(Infinity, async (): Promise<Record<string, string>> => {
  const response = await fetch(ID_MAP_URL);
  return response.json();
});

const loadBulkIds = async (): Promise<BulkIds> => {
  const response = await fetch(VARIANTS_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Fetching the bulk variants failed with status ${response.status}`);
  }
  const variantIds: string[] = [];
  const cardIds = new Set<number>();
  for await (const variant of streamJsonArray<Variant>(response.body, 'variants')) {
    variantIds.push(variant.id);
    variant.uses.forEach((use) => cardIds.add(use.card.id));
  }
  return { variantIds, cardIds: [...cardIds].sort((a, b) => a - b) };
};

/* The ids of every combo and of every card in a combo, downloaded at most once per cache period. */
const fetchBulkIds = cachedLoader(BULK_IDS_MAX_AGE_MS, loadBulkIds);

const BulkApiService = {
  fetchLegacyMap,
  fetchBulkIds,
};

export default BulkApiService;
