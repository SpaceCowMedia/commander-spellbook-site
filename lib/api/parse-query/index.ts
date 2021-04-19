import type { SearchParameters } from "../types";
import parseColorIdentity from "./parse-color-identity";
import parseComboData from "./parse-combo-data";
import parseTags from "./parse-tags";
import parseSort from "./parse-sort";
import parseOrder from "./parse-order";

const OPERATORS = [":", "=", ">=", "<=", "<", ">"];
const OPERATOR_REGEX = new RegExp(`(${OPERATORS.join("|")})`);

function collectKeywordedQueries(
  params: SearchParameters,
  query: string
): string {
  // admittedly, this is kind of weird, but basically
  // as we parse the keyword search terms, we want to
  // remove them from the query to make the plaintext
  // search logic soooooooo much simpler, so we save
  // the original query in a new variable and mutate
  // that as we go along, then finally return that new
  // query string for use in the collectPlainNameQueries
  // call
  let newQuery = query;

  // this regex pretty complex, thanks to @lejeunerenard for help with it
  // (-)? optional negative sign
  // \b(\w+) a word boundary and any number of word characters
  // (:|=|>=|<=|>|<) the operators we look for
  // (['"]?) an optional capture for either a single or double quote
  // ( an open capture group
  //   (?:.(?!\4))+. any number of characters that do not match \4, the captured quote
  //   | or
  //   [^\s]+ any number of characters that are not spaces
  // ) the closing of the capture group
  // \4 the closing single or double quote
  const queries =
    query.match(
      /(-)?\b(\w+)(:|=|>=|<=|>|<)(['"]?)((?:.(?!\4))+.|[^\s]+)\4/gi
    ) || [];

  queries.forEach((group) => {
    newQuery = newQuery.replace(group, "");

    const operator = (group.match(OPERATOR_REGEX) || [":"])[0];
    const indexOfOperator = group.indexOf(operator);
    const key = group
      .substring(0, indexOfOperator)
      .toLowerCase()
      .replace(/_/g, "");
    let value = group.substring(
      indexOfOperator + operator.length,
      group.length
    );

    if (value.length > 2) {
      const firstChar = value.charAt(0);
      const lastChar = value.charAt(value.length - 1);
      if (
        (firstChar === "'" && lastChar === "'") ||
        (firstChar === '"' && lastChar === '"')
      ) {
        value = value.substring(1, value.length - 1);
      }
    }

    switch (key) {
      case "spellbookid":
      case "sid":
      case "sbid":
        params.id.includeFilters.push(value);
        break;
      case "-spellbookid":
      case "-sid":
      case "-sbid":
        params.id.excludeFilters.push(value);
        break;
      case "is":
      case "-is":
      case "not":
      case "-not":
      case "include":
      case "-include":
      case "exclude":
      case "-exclude":
        parseTags(params, key, operator, value);
        break;
      case "ci":
      case "commander":
      case "color":
      case "colors":
      case "coloridentity":
      case "id":
      case "ids":
      case "c":
      case "-ci":
      case "-commander":
      case "-color":
      case "-colors":
      case "-coloridentity":
      case "-id":
      case "-ids":
      case "-c":
        parseColorIdentity(params, key, operator, value);
        break;
      case "card":
      case "cards":
      case "-card":
      case "-cards":
      case "pre":
      case "prerequisite":
      case "prerequisites":
      case "-pre":
      case "-prerequisite":
      case "-prerequisites":
      case "step":
      case "steps":
      case "-step":
      case "-steps":
      case "res":
      case "result":
      case "results":
      case "-res":
      case "-result":
      case "-results":
        parseComboData(params, key, operator, value);
        break;
      case "sort":
        parseSort(params, operator, value);
        break;
      case "order":
        parseOrder(params, operator, value);
        break;
      default:
        params.errors.push({
          key,
          value,
          message: `Could not parse keyword "${key}" with value "${value}".`,
        });
    }
  });

  return newQuery;
}

function collectPlainNameQueries(
  params: SearchParameters,
  query: string
): void {
  const alphanumericQuery = query.replace(/[^\w\d\s]/g, "");

  const queries =
    alphanumericQuery.match(
      // (^|\s) - either starts at the beginning of the line or begins with a space
      // ([\w\d]+) -the captured word
      /(^|\s)([\w\d]+)/gi
    ) || [];

  queries.forEach((value) => {
    parseComboData(params, "card", ":", value.trim());
  });
}

export default function parseQuery(query: string): SearchParameters {
  const parameters: SearchParameters = {
    id: {
      includeFilters: [],
      excludeFilters: [],
    },
    cards: {
      sizeFilters: [],
      includeFilters: [],
      excludeFilters: [],
    },
    colorIdentity: {
      includeFilters: [],
      excludeFilters: [],
      sizeFilters: [],
    },
    prerequisites: {
      sizeFilters: [],
      includeFilters: [],
      excludeFilters: [],
    },
    steps: {
      sizeFilters: [],
      includeFilters: [],
      excludeFilters: [],
    },
    results: {
      sizeFilters: [],
      includeFilters: [],
      excludeFilters: [],
    },
    tags: {},
    errors: [],
  };

  if (!query) {
    return parameters;
  }

  // kind of weird that this returns a query string,
  // but it was the easiest way to both collect the
  // capture groups and remove those capture groups
  // from the query, which ulimately makes the searching
  // for plain name queries sooooo much easier
  query = collectKeywordedQueries(parameters, query);
  collectPlainNameQueries(parameters, query);

  return parameters;
}
