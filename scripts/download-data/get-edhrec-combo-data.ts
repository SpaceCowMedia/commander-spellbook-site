import getData from "../shared/get";
import log from "../shared/log";

type RawComboData = Record<string, [number, string[], string]>;
type ComboData = Record<
  string,
  {
    slug: string;
    numberOfDecks: number;
  }
>;

export default async function getEDHRECComboData(): Promise<ComboData> {
  log("Looking up EDHREC combo data");

  const rawData = (await getData(
    "https://edhrec.com/data/spellbook_counts.json"
  )) as RawComboData;

  return Object.keys(rawData).reduce((accum, key) => {
    accum[key] = {
      numberOfDecks: rawData[key][0],
      slug: rawData[key][2],
    };

    return accum;
  }, {} as ComboData);
}
