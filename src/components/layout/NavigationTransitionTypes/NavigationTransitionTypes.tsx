import React, { addTransitionType, startTransition, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Router from 'next/router';
import {
  NO_ANIMATION,
  PAGE_TURNS,
  bindPendingTransition,
  clearPendingTransition,
  expectHistoryTransition,
  getTurningSheet,
  hideTurningSheet,
  historyPageTurn,
  showTurningSheet,
  takePendingTransition,
} from 'lib/viewTransitions';

const pagesCanTurn = () =>
  'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const NavigationTransitionTypes: React.FC = () => {
  const [, setTaggedNavigations] = useState(0);

  useEffect(() => {
    // Next calls this from its own popstate listener, before the navigation starts.
    const onBeforePopState = ({ as }: { as: string }) => {
      const event = window.event;
      const browserAnimated = event instanceof PopStateEvent && event.hasUAVisualTransition;
      expectHistoryTransition(
        as,
        browserAnimated ? NO_ANIMATION : (historyPageTurn(Router.asPath, as) ?? NO_ANIMATION),
      );
      return true;
    };

    // Runs synchronously right before Next renders the navigation, which then joins this transition's lane.
    const onBeforeHistoryChange = (as: string) => {
      const type = takePendingTransition(as);
      const turnsPage = type !== undefined && PAGE_TURNS.includes(type);
      if (turnsPage) {
        // Next scrolls to the top after rendering anyway; doing it first captures the old results where the new ones will be.
        window.scrollTo(0, 0);
      }
      // The view transition captures the old page as it is now, so the second print of it, for the sheet that turns,
      // has to be committed already. Any other navigation must not capture one left over from a turn still running.
      if (turnsPage && pagesCanTurn()) {
        flushSync(showTurningSheet);
      } else if (getTurningSheet() !== 0) {
        flushSync(() => hideTurningSheet());
      }
      if (type) {
        startTransition(() => {
          addTransitionType(type);
          setTaggedNavigations((count) => count + 1);
        });
      }
    };

    const onRouteChangeError = (_error: unknown, as: string) => clearPendingTransition(as);

    Router.beforePopState(onBeforePopState);
    Router.events.on('routeChangeStart', bindPendingTransition);
    Router.events.on('beforeHistoryChange', onBeforeHistoryChange);
    Router.events.on('routeChangeComplete', clearPendingTransition);
    Router.events.on('routeChangeError', onRouteChangeError);
    return () => {
      Router.beforePopState(() => true);
      Router.events.off('routeChangeStart', bindPendingTransition);
      Router.events.off('beforeHistoryChange', onBeforeHistoryChange);
      Router.events.off('routeChangeComplete', clearPendingTransition);
      Router.events.off('routeChangeError', onRouteChangeError);
    };
  }, []);

  return null;
};

export default NavigationTransitionTypes;
