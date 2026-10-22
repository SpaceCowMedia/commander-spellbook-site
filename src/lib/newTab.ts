import { createContext } from 'react';

/* True where following a link in the same tab would throw away work in progress, such as a submission form, the
   combo being voted on or the combos found for a deck: the cards and combos shown there open in a new tab instead. */
export const NewTabContext = createContext(false);
