import React, { ViewTransition } from 'react';
import { PAGE_TURNS } from 'lib/viewTransitions';

const EXIT = { ...Object.fromEntries(PAGE_TURNS.map((type) => [type, 'pageTurnExit'])), default: 'none' };
const ENTER = { ...Object.fromEntries(PAGE_TURNS.map((type) => [type, 'pageTurnEnter'])), default: 'none' };

interface Props {
  page: number;
  children: React.ReactNode;
}

// The sheet is opaque so a page sliding or flipping away doesn't show through its gaps.
const PageTurn: React.FC<Props> = ({ page, children }) => (
  <ViewTransition key={page} exit={EXIT} enter={ENTER} default="none">
    <div className="bg-(--page-background)">{children}</div>
  </ViewTransition>
);

export default PageTurn;
