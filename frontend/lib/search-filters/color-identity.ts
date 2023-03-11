import type {
  SearchParameters,
  FormattedApiResponse,
  ColorIdentityValueFilter,
} from "../types";

function getColorIdentityMethodFilter(
  combo: FormattedApiResponse
): Parameters<typeof Array.prototype.find>[0] {
  return function filterColorIdentityByMethod(
    filter: ColorIdentityValueFilter
  ) {
    switch (filter.method) {
      case "=":
        return combo.colorIdentity.is(filter.value);
      case ">":
        return (
          combo.colorIdentity.includes(filter.value) &&
          !combo.colorIdentity.is(filter.value)
        );
      case ">=":
        return combo.colorIdentity.includes(filter.value);
      case "<":
        return (
          combo.colorIdentity.isWithin(filter.value) &&
          !combo.colorIdentity.is(filter.value)
        );
      case "<=":
      case ":":
        return combo.colorIdentity.isWithin(filter.value);
      default:
        return true;
    }
  };
}

export default function filterColorIdentity(
  combos: FormattedApiResponse[],
  params: SearchParameters
): FormattedApiResponse[] {
  if (params.colorIdentity.includeFilters.length > 0) {
    combos = combos.filter((combo) => {
      return params.colorIdentity.includeFilters.every(
        getColorIdentityMethodFilter(combo)
      );
    });
  }

  if (params.colorIdentity.excludeFilters.length > 0) {
    combos = combos.filter((combo) => {
      return !params.colorIdentity.excludeFilters.find(
        getColorIdentityMethodFilter(combo)
      );
    });
  }

  return combos;
}
