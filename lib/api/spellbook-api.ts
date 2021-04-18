import transformGoogleSheetsData from "./transform-google-sheets-data";
import formatApiResponse from "./format-api-response";
import type { FormattedApiResponse } from "./types";

const GOOGLE_SHEETS_API_ENDPOINT =
  "https://sheets.googleapis.com/v4/spreadsheets/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/values:batchGet?ranges=combos!A2:Q&key=AIzaSyBD_rcme5Ff37Evxa4eW5BFQZkmTbgpHew";
const LOCAL_BACKUP_API_ENDPOINT = "/api/combo-data.json";

let cachedPromise: Promise<FormattedApiResponse[]>;
let useCachedResponse = false;

function fetchFromGoogleSheets(): Promise<FormattedApiResponse[]> {
  return fetch(GOOGLE_SHEETS_API_ENDPOINT)
    .then((res) => res.json())
    .then(transformGoogleSheetsData)
    .then(formatApiResponse);
}

export default function lookupApi(
  useGoogleSheetsEndpoint = false
): Promise<FormattedApiResponse[]> {
  if (useGoogleSheetsEndpoint) {
    return fetchFromGoogleSheets();
  }

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

  if (process.server) {
    cachedPromise = fetchFromGoogleSheets();
  } else {
    cachedPromise = fetch(LOCAL_BACKUP_API_ENDPOINT)
      .then((res) => res.json())
      .then(formatApiResponse);
  }

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
