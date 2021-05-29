import type {
  FormattedApiResponse,
  SearchParameters,
  VendorValue,
} from "../types";

export const DATA_TYPES: ["cards", "prerequisites", "steps", "results"] = [
  "cards",
  "prerequisites",
  "steps",
  "results",
];

const PRICE_VENDOR_MAP: Record<VendorValue, string> = {
  tcgplayer: "TCGplayer",
  cardkingdom: "Card Kingdom",
};

function numberOperatorAsWord(operator: string): string {
  switch (operator) {
    case "=":
      return "is";
    case ">":
      return "is greater than";
    case "<":
      return "is less than";
    case ">=":
      return "is greater than or equal to";
    case "<=":
      return "is less than or equal to";
    default:
      return operator;
  }
}

function colorOperatorAsWord(operator: string): string {
  switch (operator) {
    case "=":
      return "exactly";
    case ">":
      return "greater than";
    case "<":
      return "less than";
    case ">=":
      return "greater than or equal to";
    case ":":
    case "<=":
      return "within";
    default:
      return operator;
  }
}

function nameOperatorAsWord(operator: string): string {
  switch (operator) {
    case "=":
      return "of exactly";
    case ":":
      return "containing";
    default:
      return operator;
  }
}

export default function creaetMessage(
  combos: FormattedApiResponse[],
  params: SearchParameters
): string {
  let message = "";

  function addToMessage(newMessage: string): void {
    if (message) {
      message += " and ";
    }

    message += newMessage;
  }

  params.id.includeFilters.forEach((id) => {
    addToMessage(`the id is "${id}"`);
  });
  params.id.excludeFilters.forEach((id) => {
    addToMessage(`the id is not "${id}"`);
  });

  DATA_TYPES.forEach((dataType) => {
    params[dataType].sizeFilters.forEach((filter) => {
      addToMessage(
        `the number of ${dataType} in the combo ${numberOperatorAsWord(
          filter.method
        )} ${filter.value}`
      );
    });

    params[dataType].includeFilters.forEach((filter) => {
      addToMessage(
        `${dataType} have a value ${nameOperatorAsWord(
          filter.method
        )} "${filter.value.replace(/"/g, '\\"')}"`
      );
    });

    params[dataType].excludeFilters.forEach((filter) => {
      addToMessage(
        `${dataType} do not have a value ${nameOperatorAsWord(
          filter.method
        )} "${filter.value.replace(/"/g, '\\"')}"`
      );
    });
  });

  params.colorIdentity.sizeFilters.forEach((filter) => {
    addToMessage(
      `the number of colors in the combo ${numberOperatorAsWord(
        filter.method
      )} ${filter.value}`
    );
  });

  params.colorIdentity.includeFilters.forEach((filter) => {
    addToMessage(
      `the color identity for the combo is ${colorOperatorAsWord(
        filter.method
      )} "${filter.value.join("")}"`
    );
  });

  params.colorIdentity.excludeFilters.forEach((filter) => {
    addToMessage(
      `the color identity for the combo is not ${colorOperatorAsWord(
        filter.method
      )} "${filter.value.join("")}"`
    );
  });

  params.price.filters.forEach((filter) => {
    addToMessage(
      `the price ${numberOperatorAsWord(filter.method)} $${filter.value.toFixed(
        2
      )}`
    );
  });

  if (params.price.filters.length > 0 && params.price.vendor) {
    message += ` (according to ${PRICE_VENDOR_MAP[params.price.vendor]})`;
  }

  if (params.tags.banned) {
    switch (params.tags.banned) {
      case "include":
        addToMessage("including combos with banned cards");
        break;
      case "exclude":
        addToMessage("excluding combos with banned cards");
        break;
      case "is":
        addToMessage("at least one card is banned in commander");
        break;
      case "not":
        addToMessage("no cards are banned in commaander");
        break;
    }
  }

  if (params.tags.spoiled) {
    switch (params.tags.spoiled) {
      case "include":
        addToMessage("including combos with cards that are not yet released");
        break;
      case "exclude":
        addToMessage("excluding combos with cards that are not yet released");
        break;
      case "is":
        addToMessage("at least one card is not yet released");
        break;
      case "not":
        addToMessage("all cards have been released");
        break;
    }
  }

  let prefix = `${combos.length} combo`;

  if (combos.length !== 1) {
    prefix += "s";
  }

  prefix += " where ";

  return prefix + message + ".";
}
