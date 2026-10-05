const QUOTE = 34;
const BACKSLASH = 92;
const OPEN_BRACE = 123;
const CLOSE_BRACE = 125;
const OPEN_BRACKET = 91;
const CLOSE_BRACKET = 93;

/* Yields the elements of the array stored under `key` in the root object of a JSON document, parsing
   one element at a time, so that documents larger than the longest string a JS engine can hold can
   still be read. Only element boundaries are found here: each element is validated by JSON.parse. */
export async function* streamJsonArray<T>(body: ReadableStream<BufferSource>, key: string): AsyncGenerator<T> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let depth = 0;
  let inString = false;
  let escaped = false;
  let rootString = '';
  let lastRootString = '';
  let inTargetArray = false;
  let elementParts: string[] | undefined;
  let elementStart = 0;
  try {
    for (;;) {
      const { done, value: chunk } = await reader.read();
      if (done) {
        throw new Error(`The JSON document ended before the end of "${key}"`);
      }
      if (elementParts) {
        elementStart = 0;
      }
      for (let i = 0; i < chunk.length; i++) {
        const code = chunk.charCodeAt(i);
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (code === BACKSLASH) {
            escaped = true;
          } else if (code === QUOTE) {
            inString = false;
            if (depth === 1) {
              lastRootString = rootString;
            }
          } else if (depth === 1) {
            rootString += chunk[i];
          }
          continue;
        }
        if (code === QUOTE) {
          inString = true;
          rootString = '';
        } else if (code === OPEN_BRACE || code === OPEN_BRACKET) {
          if (depth === 1 && code === OPEN_BRACKET && lastRootString === key) {
            inTargetArray = true;
          } else if (depth === 2 && inTargetArray) {
            elementParts = [];
            elementStart = i;
          }
          depth++;
        } else if (code === CLOSE_BRACE || code === CLOSE_BRACKET) {
          depth--;
          if (depth === 2 && elementParts) {
            elementParts.push(chunk.slice(elementStart, i + 1));
            yield JSON.parse(elementParts.join('')) as T;
            elementParts = undefined;
          } else if (depth === 1 && inTargetArray) {
            return;
          }
        }
      }
      if (elementParts) {
        elementParts.push(chunk.slice(elementStart));
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}
