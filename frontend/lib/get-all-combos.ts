import lookupApi, {lookupApiCompressed} from "./spellbook-api";

import type {CompressedApiResponse, FormattedApiResponse} from "./types";

export async function getAllCombosCompressed(): Promise<CompressedApiResponse[]> {
  const combos = await lookupApiCompressed();

  return combos;
}

export default async function getAllCombos(): Promise<FormattedApiResponse[]> {
  const combos = await lookupApi();

  return combos;
}
