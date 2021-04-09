import type { SearchParameters } from "../types";
import parseColorFromValue from "./parse-color-from-value";

export default function parseColorIdentity(
  params: SearchParameters,
  key: string,
  operator: string,
  value: string
): void {
  const isNegativeKey = key.charAt(0) === "-";

  if (Number(value) >= 0 && Number(value) < 6) {
    if (isNegativeKey) {
      params.errors.push({
        key,
        value,
        message: `The color identity key "${key}" does not support operator "${operator}".`,
      });

      return;
    }

    params.colorIdentity.sizeFilters.push({
      method: operator,
      value: Number(value),
    });

    return;
  }

  const identity = parseColorFromValue(value);

  if (!identity) {
    params.errors.push({
      key,
      value,
      message: `The value "${value}" is invalid for the color identity key "${key}".`,
    });
    return;
  }

  if (isNegativeKey) {
    params.colorIdentity.excludeFilters.push({
      method: operator,
      value: identity,
    });

    return;
  }

  params.colorIdentity.includeFilters.push({
    method: operator,
    value: identity,
  });
}
