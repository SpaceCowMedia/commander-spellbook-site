import type { SearchParameters } from "../types";

const VENDOR_OPERATORS = ["=", ":"];

export default function parsePriceData(
  params: SearchParameters,
  key: string,
  operator: string,
  value: string
): void {
  if (key === "vendor") {
    if (params.price.vendor) {
      params.errors.push({
        key,
        value,
        message: `Vendor option "${params.price.vendor}" already chosen. Vendor choice "${value}" will be ignored.`,
      });

      return;
    }

    if (!VENDOR_OPERATORS.includes(operator)) {
      params.errors.push({
        key,
        value,
        message: `The key "${key}" does not support operator "${operator}".`,
      });

      return;
    }

    if (value !== "tcgplayer" && value !== "cardkingdom") {
      params.errors.push({
        key,
        value,
        message: `Vendor option "${value}" is not a valid vendor.`,
      });

      return;
    }

    params.price.vendor = value;

    return;
  }

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

  params.price.filters.push({
    method: operator,
    value: numberValue,
  });
}
