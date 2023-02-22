export default function chunkifyArray<T = unknown>(
  array: Array<T>,
  MAX_BATCH: number
): Array<T[]> {
  const newArray = [] as Array<T[]>;

  for (let i = 0; i < array.length; i += MAX_BATCH) {
    const chunk = array.slice(i, i + MAX_BATCH);
    newArray.push(chunk);
  }

  return newArray;
}
