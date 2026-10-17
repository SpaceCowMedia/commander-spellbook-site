/* Wraps an async loader so its result is reused for maxAgeMs, concurrent callers share one load,
   and a failed refresh falls back to the previous value when there is one. */
export function cachedLoader<T>(maxAgeMs: number, load: () => Promise<T>): () => Promise<T> {
  let value: T | undefined;
  let loadedAt = 0;
  let pending: Promise<T> | undefined;

  return () => {
    if (value !== undefined && Date.now() - loadedAt < maxAgeMs) {
      return Promise.resolve(value);
    }
    pending ??= load()
      .then((loaded) => {
        value = loaded;
        loadedAt = Date.now();
        return loaded;
      })
      .catch((error) => {
        if (value === undefined) {
          throw error;
        }
        console.error('Serving a stale value after a failed refresh', error);
        return value;
      })
      .finally(() => {
        pending = undefined;
      });
    return pending;
  };
}
