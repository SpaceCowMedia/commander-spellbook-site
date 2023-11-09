import type {
  CompressedApiResponse,
  VariantBulkData,
} from "../../frontend/lib/types";
import getData from "../shared/get";
import log from "../shared/log";
import {
  processBackendResponses
} from "../../frontend/lib/backend-processors";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'



export default async function getBackendData(): Promise<CompressedApiResponse[]> {
  log("Fetching Combo data from backend bucket");
  const variantData = await getData(VARIANT_DATA_URL) as VariantBulkData
  log(`Found ${variantData.variants.length} variants in the backend bucket.`);
  const reverseIdMap = await getData(ID_MAP_URL) as Record<string, string>
  log(`Found ${Object.keys(reverseIdMap).length} ids in the id map.`)
  return processBackendResponses(variantData.variants, reverseIdMap)
}
