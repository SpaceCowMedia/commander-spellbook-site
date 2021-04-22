import getData from "../shared/get";
import log from "../shared/log";
import transformGoogleSheetsData from "../../lib/api/transform-google-sheets-data";
import type {
  CommanderSpellbookAPIResponse,
  CompressedApiResponse,
} from "../../lib/api/types";

export default async function getGoogleSheetsComboData(): Promise<
  CompressedApiResponse[]
> {
  log("Fetching Combo data from Google Sheets");

  const rawData = (await getData(
    "https://sheets.googleapis.com/v4/spreadsheets/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/values:batchGet?ranges=combos!A2:Q&key=AIzaSyBD_rcme5Ff37Evxa4eW5BFQZkmTbgpHew"
  )) as CommanderSpellbookAPIResponse;
  const compressedData = transformGoogleSheetsData(
    rawData as CommanderSpellbookAPIResponse
  );

  return compressedData;
}
