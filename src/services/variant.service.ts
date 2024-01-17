import requestService from "./request.service";
import {Variant, VariantAlias} from "../lib/types";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'

let cachedLegacyMap: Record<string, string> | null = null
const fetchLegacyMap = async () => {
  if (cachedLegacyMap) return cachedLegacyMap
  const legacyMap = await requestService.get<Record<string, string>>(ID_MAP_URL)
  cachedLegacyMap = legacyMap
  return legacyMap
}
const fetchVariant = async (id: string): Promise<Variant | null> => {
  const variant = await requestService.get(`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/variants/${id}/`).catch(() => null)
  return variant
}
const fetchVariantAlias = async (id: string): Promise<VariantAlias | null> => {
  const alias = await requestService.get(`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/variant-aliases/${id}/`).catch(() => null)
  return alias
}

const VariantService = {
  fetchLegacyMap,
  fetchVariant,
  fetchVariantAlias,
}

export default VariantService;
