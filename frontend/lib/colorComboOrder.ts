import type { ColorIdentityColors } from "./types";

// Order of color combos as displayed on EDHREC.com
const COLOR_ORDER: ColorIdentityColors[][] = [
  ["c"], // colorless

  // mono color
  ["w"],
  ["u"],
  ["b"],
  ["r"],
  ["g"],

  // guilds
  ["w", "u"],
  ["u", "b"],
  ["b", "r"],
  ["r", "g"],
  ["g", "w"],
  ["w", "b"],
  ["u", "r"],
  ["b", "g"],
  ["r", "w"],
  ["g", "u"],

  // shards and wedges
  ["w", "u", "b"],
  ["u", "b", "r"],
  ["b", "r", "g"],
  ["r", "g", "w"],
  ["g", "w", "u"],
  ["w", "b", "g"],
  ["u", "r", "w"],
  ["b", "g", "u"],
  ["r", "w", "b"],
  ["g", "u", "r"],

  // 4+ colors
  ["w", "u", "b", "r"],
  ["u", "b", "r", "g"],
  ["b", "r", "g", "w"],
  ["r", "g", "w", "u"],
  ["g", "w", "u", "b"],
  ["w", "u", "b", "r", "g"],
];

export default COLOR_ORDER;
