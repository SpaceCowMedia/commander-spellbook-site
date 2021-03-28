import formatApiResponse from "./format-api-response";
import type {
  CommanderSpellbookAPIResponse,
  FormattedApiResponse,
} from "./types";

const LOCAL_API_ENDPOINT = "/api/combo-data.json";

let cachedPromise: Promise<FormattedApiResponse[]>;
let useCachedResponse = false;

export default function lookupApi(): Promise<FormattedApiResponse[]> {
  if (useCachedResponse) {
    return cachedPromise;
  }

  // on the server, we pull in the file we download from the Google Sheets API
  // on the browser, we fetch that same file using a network request
  // this ensures that the data remains in sync between the server and the browser
  if (process.server) {
    const json = require("../../static/api/combo-data.json") as CommanderSpellbookAPIResponse;
    cachedPromise = Promise.resolve(formatApiResponse(json));
  } else {
    cachedPromise = window
      .fetch(LOCAL_API_ENDPOINT)
      .then((res) => {
        return res.json();
      })
      .then(formatApiResponse);
  }

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
