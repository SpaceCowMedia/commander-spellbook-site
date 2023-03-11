import type { SearchParameters } from "../types";
import normalizeStringInput from "../normalizeStringInput";

const SUPPORTED_OPERATORS = [":", "="];

export default function parseOrder(
  params: SearchParameters,
  operator: string,
  value: string
): void {
  if (params.order) {
    params.errors.push({
      key: "order",
      value,
      message: `Order option "${params.order}" already chosen. Ordering by "${value}" will be ignored.`,
    });

    return;
  }

  if (!SUPPORTED_OPERATORS.includes(operator)) {
    params.errors.push({
      key: "order",
      value,
      message: `Order does not support the "${operator}" operator.`,
    });

    return;
  }

  value = normalizeStringInput(value);

  switch (value) {
    case "asc":
    case "ascending":
      value = "ascending";
      break;
    case "desc":
    case "descending":
      value = "descending";
      break;
  }

  if (value !== "ascending" && value !== "descending") {
    params.errors.push({
      key: "order",
      value,
      message: `Unknown order option "${value}".`,
    });
    return;
  }

  params.order = value;
}
