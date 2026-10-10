import { useState } from 'react';

let lastKey = 0;
const newKeys = (count: number) => Array.from({ length: count }, () => ++lastKey);

// Keys for the rows of an editable list, kept in step with its values by hand, so that removing a row leaves the
// others mounted with their focus and input state.
export default function useRowKeys(initialCount: number) {
  const [keys, setKeys] = useState(() => newKeys(initialCount));
  return {
    keys,
    add: () => setKeys((current) => current.concat(newKeys(1))),
    remove: (index: number) => setKeys((current) => current.filter((_, i) => i !== index)),
    reset: (count: number) => setKeys(newKeys(count)),
  };
}
