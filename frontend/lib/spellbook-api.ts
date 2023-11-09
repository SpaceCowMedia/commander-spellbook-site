import formatApiResponse from "./format-api-response";
import type { CompressedApiResponse, FormattedApiResponse } from "./types";
import {VariantBulkData} from "./types";
import {processBackendResponses} from "./backend-processors";


const LOCAL_BACKUP_API_ENDPOINT = "/api/combo-data.json";
const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'

let cachedPromise: Promise<FormattedApiResponse[]>;
let useCachedResponse = false;

async function fetchFromBackend(): Promise<FormattedApiResponse[]> {
  const variantData = await fetch(VARIANT_DATA_URL).then(res => res.json()) as VariantBulkData
  const reverseIdMap = await fetch(ID_MAP_URL).then(res => res.json())  as Record<string, string>
  return formatApiResponse(processBackendResponses(variantData.variants, reverseIdMap))
}



export default function lookupApi(
  useBackend = false
): Promise<FormattedApiResponse[]> {
  if (useBackend) {
    return fetchFromBackend();
  }

  if (useCachedResponse) {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "production"
    ) {
      return cachedPromise;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cachedPromise);
      }, 1000);
    });
  }

  if (typeof window === "undefined") {
    try {
      const data = require("../public/api/combo-data.json") as CompressedApiResponse[];
      cachedPromise = Promise.resolve(formatApiResponse(data));
    }
    catch (e) {
      cachedPromise = fetchFromBackend();
    }
  } else {
    cachedPromise = fetch(
      LOCAL_BACKUP_API_ENDPOINT + "?cache-bust=" + Math.random()
    )
      .then((res) => res.json())
      .then(formatApiResponse);
  }

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
