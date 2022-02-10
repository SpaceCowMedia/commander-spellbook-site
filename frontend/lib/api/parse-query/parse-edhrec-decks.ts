import type { SearchParameters } from "../types";

export default function parseEDHRECDecks(
  params: SearchParameters,
  key: string,
  operator: string,
  value: string
): void {
  if (operator === ":") {
    params.errors.push({
      key,
      value,
      message: `The key "${key}" does not support operator "${operator}".`,
    });

    return;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    params.errors.push({
      key,
      value,
      message: `The key "${key}" is not compatible with value "${value}".`,
    });

    return;
  }

  params.edhrecDecks.sizeFilters.push({
    method: operator,
    value: numberValue,
  });
}
