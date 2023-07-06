// import get from "../shared/get";
// import log from "../shared/log";
import type { FeaturedRule } from "./is-featured";

// const MOCKED_RULES: FeaturedRule[] = [
//   { kind: "card", setCode: "dom" },
//   { kind: "card", setCode: "one" },
// ];

// type RawPropertiesResponse = {
//   results: { key: string; value: string }[];
// };

export default async function getFeaturedRules(): Promise<FeaturedRule[]> {
  // const { EDITOR_BACKEND_URL } = process.env;
  //
  // if (!EDITOR_BACKEND_URL) {
  //   log(
  //     "Could not find EDITOR_BACKEND_URL env variable. Using mocked data for featured combos",
  //     "red"
  //   );
  //   return MOCKED_RULES;
  // }
  //
  // // TODO pull out data and transform to Featured Rules type
  // const dataFromEditorBackend = await get<RawPropertiesResponse>(
  //   `${EDITOR_BACKEND_URL}properties/?format=json`
  // );
  // const rawData = dataFromEditorBackend.results.find((data) => {
  //   return data.key === "featured_set_codes";
  // });
  const rawData = {value: 'ltr,ltc'}
  const setCodes = rawData?.value.split(",").map((val) => {
    return {
      kind: "card",
      setCode: val.trim(),
    };
  });

  if (!setCodes) {
    return [];
  }

  return setCodes as FeaturedRule[];
}
