import type { EDHRecData } from "./types";

const EDHREC_ENDPOINT = "https://edhrec.com/api/prices/";
const LOCAL_ENDPOINT = "/api/price-data.json";

let cachedPromise: Promise<EDHRecData>;
let useCachedResponse = false;

export default function getPriceData(): Promise<EDHRecData> {
  if (useCachedResponse) {
    return cachedPromise;
  }

  const endpoint = process.server ? EDHREC_ENDPOINT : LOCAL_ENDPOINT;

  cachedPromise = fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      return data as EDHRecData;
    });

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
