import getData from "../shared/get";
import log from "../shared/log";

type LegacyRawComboData = Record<string, [number, string[], string]>;
type Combo = { cardnames: string[]; count: number; url: string };
type RawComboData = {
  combos: Record<string, Combo>;
};
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
  )) as RawComboData | LegacyRawComboData;

  // TODO remove this logic when data is swapped over
  if (!rawData.combos) {
    const legacyData = rawData as LegacyRawComboData;

    return Object.keys(legacyData).reduce((accum, key) => {
      accum[key] = {
        numberOfDecks: legacyData[key][0],
        slug: legacyData[key][2],
      };

      return accum;
    }, {} as ComboData);
  }

  const combos = (rawData as RawComboData).combos;

  return Object.keys(combos).reduce((accum, id) => {
    accum[id] = {
      numberOfDecks: combos[id].count,
      slug: combos[id].url,
    };

    return accum;
  }, {} as ComboData);
}
