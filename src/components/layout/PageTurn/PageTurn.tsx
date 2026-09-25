import React, { ViewTransition } from 'react';
import { PAGE_TURN_BACK, PAGE_TURN_FORWARD } from 'lib/viewTransitions';

const EXIT = { [PAGE_TURN_FORWARD]: 'pageTurnExit', [PAGE_TURN_BACK]: 'pageTurnExit', default: 'none' };
const ENTER = { [PAGE_TURN_FORWARD]: 'pageTurnEnter', [PAGE_TURN_BACK]: 'pageTurnEnter', default: 'none' };

interface Props {
  page: number;
  children: React.ReactNode;
}

// The sheet is opaque so a turning page doesn't show the page underneath through its gaps. Its shading layer gets
// a name per page, so each one stays with its own page instead of morphing into the next.
const PageTurn: React.FC<Props> = ({ page, children }) => (
  <ViewTransition key={page} exit={EXIT} enter={ENTER} default="none">
    <div className="relative bg-(--page-background)">
      {children}
      <div
        className="pageTurnLight"
        aria-hidden="true"
        style={{ viewTransitionName: `page-turn-light-${page}`, viewTransitionClass: 'pageTurnLight' }}
      />
    </div>
  </ViewTransition>
);

export default PageTurn;
