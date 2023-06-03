import type { CompressedApiResponse, VariantBulkData } from "../../frontend/lib/types";
import getData from "../shared/get";
import log from "../shared/log";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'

const invert = (input: Record<string, string>) => {
  let counter = 0
  const output: Record<string, string> = {}
  for (const key in input) {
    if (output[input[key]]) counter++
    output[input[key]] = key
  }
  log(`Ignore ${counter} duplicate keys`)
  return output
}

export default async function getBackendData(): Promise<CompressedApiResponse[]> {
  log("Fetching Combo data from backend bucket");
  const variantData = await getData(VARIANT_DATA_URL) as VariantBulkData
  const reverseIdMap = await getData(ID_MAP_URL) as Record<string, string>
  const idMap = invert(reverseIdMap)
  const output: CompressedApiResponse[] = []
  for (const variant of variantData.variants) {
    const compressedVariant: CompressedApiResponse = {
      d : idMap[variant.id],
      c : variant.uses.map(card => card.card.name),
      i : variant.identity,
      p : variant.otherPrerequisites,
      s : variant.description,
      r : variant.produces.map(feature => feature.name).join('. '),
      b : variant.legal ? 0 : 1,
      o : variant.spoiler ? 1 : 0
    }
    output.push(compressedVariant)
  }
  return output
}
