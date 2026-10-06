import React, { ViewTransition, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  PAGE_TURNS,
  PAGE_TURN_SHEET,
  getTurningSheet,
  hideTurningSheet,
  subscribeTurningSheet,
} from 'lib/viewTransitions';

const EXIT = { ...Object.fromEntries(PAGE_TURNS.map((type) => [type, 'pageTurnExit'])), default: 'none' };
const ENTER = { ...Object.fromEntries(PAGE_TURNS.map((type) => [type, 'pageTurnEnter'])), default: 'none' };

// Runs as the turn starts, and returns what React runs once its view transition has finished.
const hideSheetAfterTurn = () => {
  const turn = getTurningSheet();
  return () => hideTurningSheet(turn);
};

interface Props {
  page: number;
  children: React.ReactNode;
}

// The page is opaque so the half turning over doesn't show through its gaps.
const PageTurn: React.FC<Props> = ({ page, children }) => {
  // Not useSyncExternalStore: its updates are synchronous, and React skips a view transition that one lands in while
  // it is still being prepared.
  const [sheet, setSheet] = useState(getTurningSheet);
  useEffect(() => subscribeTurningSheet(setSheet), []);

  const pageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // The sheet that turns needs the page a second time. Rendering it again would cost as much as the navigation itself
  // right before the turn starts, so the sheet copies the page's DOM instead: the page being left until the navigation
  // commits, then the new one, kept in step while its effects fill it in.
  useLayoutEffect(() => {
    const copy = sheetRef.current;
    const original = pageRef.current;
    if (!copy || !original) {
      return;
    }
    const print = () => copy.replaceChildren(...Array.from(original.childNodes, (node) => node.cloneNode(true)));
    print();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(print);
    });
    // Not attributes: React names the page for the view transition, which would copy it all again for nothing.
    observer.observe(original, { subtree: true, childList: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sheet, page]);

  return (
    <div className="relative">
      <ViewTransition
        key={page}
        exit={EXIT}
        enter={ENTER}
        default="none"
        onExit={hideSheetAfterTurn}
        onEnter={hideSheetAfterTurn}
      >
        <div ref={pageRef} className="bg-(--page-background)">
          {children}
        </div>
      </ViewTransition>
      {sheet !== 0 && (
        // A snapshot records what an element paints, so rather than hidden the copy is kept under the page.
        <div
          ref={sheetRef}
          aria-hidden
          inert
          className="absolute inset-0 -z-10 bg-(--page-background)"
          style={{ viewTransitionName: PAGE_TURN_SHEET }}
        />
      )}
    </div>
  );
};

export default PageTurn;
