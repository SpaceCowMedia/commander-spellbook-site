export function queryParameterAsString(param: any): string | undefined {
  if (typeof param === 'string') {
    return param;
  }
  if (Array.isArray(param)) {
    return param[0];
  }
  return undefined;
}
