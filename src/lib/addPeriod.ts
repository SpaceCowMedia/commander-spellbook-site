export const addPeriod = (str: string) => {
  let output = str.trim();
  if (output[output.length - 1] !== '.') output += '.';
  return output;
};
