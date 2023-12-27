import requestService from "./request.service";
import {Variant, VariantBulkData} from "../lib/types";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'
export let variantCount = 0
let cachedVariants: Variant[] | null = null
const fetchAllVariants = async () => {
  if (cachedVariants) return cachedVariants
  const variantData = await requestService.get(VARIANT_DATA_URL) as VariantBulkData
  variantCount = variantData.variants.length
  cachedVariants = variantData.variants
  return variantData.variants
}

let cachedVariantMap: Record<string, Variant> | null = null
const fetchVariantMap = async () => {
  if (cachedVariantMap) return cachedVariantMap
  const variants = await fetchAllVariants()
  const variantMap = variants.reduce((acc, variant) => {
    acc[variant.id] = variant
    return acc
  }, {} as Record<string, Variant>)
  cachedVariantMap = variantMap
  return variantMap
}

let cachedLegacyMap: Record<string, string> | null = null
const fetchLegacyMap = async () => {
  if (cachedLegacyMap) return cachedLegacyMap
  const legacyMap = await requestService.get<Record<string, string>>(ID_MAP_URL)
  cachedLegacyMap = legacyMap
  return legacyMap
}

const fetchVariant = async (id: string, useBulkData=false): Promise<Variant | null> => {
  if (typeof window === 'undefined' && useBulkData) {
    const variantMap = await fetchVariantMap()
    const variant = variantMap[id]
    if (variant) return variant
  }
  const variant = await requestService.get(`${process.env.NEXT_PUBLIC_API_URL}/variants/${id}/`)
  if (variant.detail === 'Not found.') return null
  return variant
}

const VariantService = {
  fetchAllVariants,
  fetchLegacyMap,
  fetchVariant,
  hasCachedVariants: !!cachedVariants,
}

export default VariantService;
