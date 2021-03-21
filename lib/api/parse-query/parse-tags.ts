import type {
  IsNotIncludeExcludeValues,
  TagValue,
  SearchParameters,
} from "../types";
type SupportedKeys =
  | "is"
  | "-is"
  | "not"
  | "-not"
  | "include"
  | "-include"
  | "exclude"
  | "-exclude";

const SUPPORTED_OPERATORS = [":"];

export default function parseTags(
  params: SearchParameters,
  key: SupportedKeys,
  operator: string,
  value: string
): void {
  let normalizedKey: TagValue;
  let normalizedValue: IsNotIncludeExcludeValues;

  if (!SUPPORTED_OPERATORS.includes(operator)) {
    params.errors.push({
      key,
      value,
      message: `The key "${key}" does not support operator "${operator}".`,
    });
    return;
  }

  switch (key) {
    case "is":
    case "-not":
      normalizedKey = "is";
      break;
    case "not":
    case "-is":
      normalizedKey = "not";
      break;
    case "include":
    case "-exclude":
      normalizedKey = "include";
      break;
    case "exclude":
    case "-include":
      normalizedKey = "exclude";
      break;
  }

  switch (value) {
    case "banned":
      normalizedValue = "banned";
      break;
    case "spoiled":
    case "previewed":
      normalizedValue = "spoiled";
      break;
    default:
      params.errors.push({
        key,
        value,
        message: `The key "${key}" does not support value "${value}".`,
      });
      return;
  }

  params.tags[normalizedValue] = normalizedKey;
}
