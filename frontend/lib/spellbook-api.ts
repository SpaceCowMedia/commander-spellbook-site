import transformGoogleSheetsData from "./transform-google-sheets-data";
import formatApiResponse from "./format-api-response";
import type {CompressedApiResponse, FormattedApiResponse} from "./types";

const GOOGLE_SHEETS_API_ENDPOINT =
  "https://sheets.googleapis.com/v4/spreadsheets/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/values:batchGet?ranges=combos!A2:Q&key=AIzaSyBD_rcme5Ff37Evxa4eW5BFQZkmTbgpHew";
const LOCAL_BACKUP_API_ENDPOINT = "/api/combo-data.json";

let cachedPromise: Promise<FormattedApiResponse[]>;
let compressedCachedPromise: Promise<CompressedApiResponse[]>;
let useCompressedCachedResponse = false;
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

    if (typeof window === 'undefined' || process.env.NODE_ENV !== "production") {
      return cachedPromise;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cachedPromise);
      }, 1000);
    });
  }

  if ( typeof window === 'undefined') {
    cachedPromise = fetchFromGoogleSheets();
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

function fetchFromGoogleSheetsCompressed(): Promise<CompressedApiResponse[]> {
  return fetch(GOOGLE_SHEETS_API_ENDPOINT)
    .then((res) => res.json())
    .then(transformGoogleSheetsData);
}

export function lookupApiCompressed(
  useGoogleSheetsEndpoint = false
): Promise<CompressedApiResponse[]> {
  if (useGoogleSheetsEndpoint) {
    return fetchFromGoogleSheetsCompressed();
  }

  if (useCompressedCachedResponse) {

    if (typeof window === 'undefined' || process.env.NODE_ENV !== "production") {
      return compressedCachedPromise;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(compressedCachedPromise);
      }, 1000);
    });
  }


  if ( typeof window === 'undefined') {
    compressedCachedPromise = fetchFromGoogleSheetsCompressed();
  } else {
    compressedCachedPromise = fetch(
      LOCAL_BACKUP_API_ENDPOINT + "?cache-bust=" + Math.random()
    )
      .then((res) => res.json())
  }

  useCompressedCachedResponse = true;

  return compressedCachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
  useCompressedCachedResponse = false;
}
