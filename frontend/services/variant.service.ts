import requestService from "./request.service";
import {VariantBulkData} from "../lib/types";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'
export let variantCount = 0
const fetchAllVariants = async () => {
  const variantData = await requestService.get(VARIANT_DATA_URL) as VariantBulkData
  variantCount = variantData.variants.length
  return variantData.variants
}

let cachedLegacyMap: Record<string, string> | null = null
const fetchLegacyMap = async () => {
  if (cachedLegacyMap) return cachedLegacyMap
  const legacyMap = await requestService.get<Record<string, string>>(ID_MAP_URL)
  cachedLegacyMap = legacyMap
  return legacyMap
}

const VariantService = {
  fetchAllVariants,
  fetchLegacyMap
}

export default VariantService;
