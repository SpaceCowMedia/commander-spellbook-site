import formatApiResponse from "./format-api-response";
import type {
  CommanderSpellbookAPIResponse,
  FormattedApiResponse,
} from "./types";

const GOOGLE_SHEETS_API_ENDPOINT =
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";
const LOCAL_BACKUP_API_ENDPOINT = "/api/combo-data.json";

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
      .fetch(GOOGLE_SHEETS_API_ENDPOINT)
      .then((res) => res.json())
      .catch(() => {
        return window
          .fetch(LOCAL_BACKUP_API_ENDPOINT)
          .then((res) => res.json());
      })
      .then(formatApiResponse);
  }

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
