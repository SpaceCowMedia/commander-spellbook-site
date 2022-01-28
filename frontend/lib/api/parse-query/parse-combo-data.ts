import normalizeStringInput from "../normalize-string-input";

import type { SearchParameters } from "../types";

export const COMBO_DATA_TYPES: ["cards", "prerequisites", "steps", "results"] =
  ["cards", "prerequisites", "steps", "results"];
const SUPPORTED_OPERATORS_FOR_DATA = [":", "="];

export default function parseComboData(
  params: SearchParameters,
  key: string,
  operator: string,
  value: string
): void {
  const isNegativeKey = key.charAt(0) === "-";
  const normalizedKey = isNegativeKey ? key.substring(1) : key;

  COMBO_DATA_TYPES.forEach((dataType) => {
    if (!dataType.includes(normalizedKey)) {
      return;
    }

    if (operator !== ":" && Number(value) >= 0) {
      if (isNegativeKey) {
        params.errors.push({
          key,
          value,
          message: `The key "${key}" does not support operator "${operator}".`,
        });

        return;
      }

      params[dataType].sizeFilters.push({
        method: operator,
        value: Number(value),
      });

      return;
    }

    if (!SUPPORTED_OPERATORS_FOR_DATA.includes(operator)) {
      params.errors.push({
        key,
        value,
        message: `Operator ${operator} is not compatible with key "${key}" and value "${value}".`,
      });

      return;
    }

    if (!normalizeStringInput(value)) {
      params.errors.push({
        key,
        value,
        message: `The key "${key}" does not support the value "${value}", try using letters and numbers.`,
      });

      return;
    }

    if (isNegativeKey) {
      params[dataType].excludeFilters.push({
        method: operator,
        value,
      });

      return;
    }

    params[dataType].includeFilters.push({
      method: operator,
      value,
    });
  });
}
