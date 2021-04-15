import formatApiResponse from "./format-api-response";
import type { FormattedApiResponse } from "./types";

const GOOGLE_SHEETS_API_ENDPOINT =
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";
const LOCAL_BACKUP_API_ENDPOINT = "/api/combo-data.json";

let cachedPromise: Promise<FormattedApiResponse[]>;
let useCachedResponse = false;

export default function lookupApi(): Promise<FormattedApiResponse[]> {
  if (useCachedResponse) {
    if (process.server || process.env.NODE_ENV !== "production") {
      return cachedPromise;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cachedPromise);
      }, 1000);
    });
  }

  cachedPromise = fetch(GOOGLE_SHEETS_API_ENDPOINT)
    .then((res) => res.json())
    .catch(() => {
      // we fall back here in the case that we start getting rate
      // limited by Google Sheets. Unlikely to happen, but still
      // possible. Using the Google Sheets version first ensures
      // we get the most up to date data.
      // https://developers.google.com/sheets/api/limits
      return fetch(LOCAL_BACKUP_API_ENDPOINT).then((res) => res.json());
    })
    .then(formatApiResponse);

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
