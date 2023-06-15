import type { CompressedApiResponse, VariantBulkData, Variant } from "../../frontend/lib/types";
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

const ZONE_MAP = {
  "H": "in hand",
  "B": "on the battlefield",
  "C": "in the command zone",
  "G": "in your graveyard",
  "L": "in your library",
  "E": "in exile",
}

const getPrerequisiteString = (variant: Variant) => {
  let output = ""
  for (const card of variant.uses) {
    output += `${card.card.name} `
    output += card.zoneLocations.map(zone => ZONE_MAP[zone as keyof typeof ZONE_MAP]).join(' or ')
    output += ". "
  }
  output += (variant.otherPrerequisites || "")
  output += variant.manaNeeded ? `${variant.manaNeeded} available. ` : ``
  return output
}

export default async function getBackendData(): Promise<CompressedApiResponse[]> {
  log("Fetching Combo data from backend bucket");
  const variantData = await getData(VARIANT_DATA_URL) as VariantBulkData
  log(`Found ${variantData.variants.length} variants in the backend bucket.`);
  const reverseIdMap = await getData(ID_MAP_URL) as Record<string, string>
  log(`Found ${Object.keys(reverseIdMap).length} ids in the id map.`)
  const idMap = invert(reverseIdMap)
  const output: CompressedApiResponse[] = []
  for (const variant of variantData.variants) {
    const compressedVariant: CompressedApiResponse = {
      d : idMap[variant.id],
      c : variant.uses.map(card => card.card.name),
      i : variant.identity.toLowerCase().split("").join(','),
      p : getPrerequisiteString(variant),
      s : variant.description,
      r : variant.produces.map(feature => feature.name).join('. '),
      b : variant.legal ? 0 : 1,
      o : variant.spoiler ? 1 : 0
    }
    output.push(compressedVariant)
  }
  return output
}
