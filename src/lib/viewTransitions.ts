import type { NextPage } from 'next';
import type { NextRouter } from 'next/router';
import { queryParameterAsString } from './queryParameters';
import { hasResultsCache } from './findMyCombosResultsCache';

export const PAGE_TURN_FORWARD = 'page-turn-forward';
export const PAGE_TURN_BACK = 'page-turn-back';
export const PAGE_TURNS = [PAGE_TURN_FORWARD, PAGE_TURN_BACK];
export const PAGE_TURN_SHEET = 'page-turn-sheet';
export const NO_ANIMATION = 'no-animation';
export const WHEEL_NEXT = 'wheel-next';
export const WHEEL_PREVIOUS = 'wheel-previous';
export const RESORT = 'resort';
export const TAB_FORWARD = 'tab-forward';
export const TAB_BACK = 'tab-back';
export const TEMPLATE_MORPH = 'template-morph';
export const TEMPLATE_MORPH_SHARE = { [TEMPLATE_MORPH]: 'templateMorph', default: 'none' };
export const THEME_SWITCH = 'theme';
export const LOAD_MORE = 'load-more';

// The home page's logo shrinks into the header's gear as the search bar docks, and grows back out of it.
export const SITE_LOGO = 'site-logo';
export const LOGO_DOCK = { [NO_ANIMATION]: 'none', default: 'logoDock' };

// Find My Combos restores its last results once mounted and scrolls back down to them, which would jump mid-fade.
const restoresScroll = (path: string) => path === '/find-my-combos' && hasResultsCache();

export type TransitionKey = (router: NextRouter) => string;

export type TransitionPage<P = object> = NextPage<P> & { transitionKey?: TransitionKey };

export function pathKey(asPath: string): string {
  const path = asPath.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

export function getTransitionKey(page: TransitionPage, router: NextRouter): string {
  return page.transitionKey?.(router) ?? pathKey(router.asPath);
}

const pageNumber = (page: unknown) => Number(queryParameterAsString(page)) || 1;

export const queryTransitionKey =
  (...params: string[]): TransitionKey =>
  (router) =>
    [pathKey(router.asPath), ...params.map((param) => queryParameterAsString(router.query[param]) ?? '')].join('|');

// As in a book, the right half of the results turns over onto the left one going forward, and back again going back.
export function pageTurn(fromPage: number, toPage: number): string {
  return toPage > fromPage ? PAGE_TURN_FORWARD : PAGE_TURN_BACK;
}

export function historyPageTurn(fromAs: string, toAs: string): string | undefined {
  const from = new URL(fromAs, 'http://localhost');
  const to = new URL(toAs, 'http://localhost');
  const fromPage = pageNumber(from.searchParams.get('page'));
  const toPage = pageNumber(to.searchParams.get('page'));
  for (const url of [from, to]) {
    url.searchParams.delete('page');
    url.searchParams.sort();
  }
  if (pathKey(from.pathname) !== pathKey(to.pathname) || from.search !== to.search || fromPage === toPage) {
    return undefined;
  }
  return pageTurn(fromPage, toPage);
}

interface PendingTransition {
  type: string;
  as?: string;
}

let pending: PendingTransition | null = null;

export function pushWithTransition(
  router: NextRouter,
  url: Parameters<NextRouter['push']>[0],
  type: string,
): Promise<boolean> {
  const request: PendingTransition = { type };
  pending = request;
  // router.push resolves only after the commit, so it must never be returned from a startTransition scope.
  const navigation = router.push(url);
  navigation
    .finally(() => {
      if (pending === request) {
        pending = null;
      }
    })
    .catch(() => undefined);
  return navigation;
}

export function expectHistoryTransition(as: string, type: string) {
  pending = { type, as };
}

export function bindPendingTransition(as: string) {
  if (pending && pending.as === undefined) {
    pending.as = as;
  } else if (pending && pending.as !== as) {
    pending = null;
  }
}

export function takePendingTransition(as: string): string | undefined {
  if (pending?.as === as) {
    const { type } = pending;
    pending = null;
    return type;
  }
  return restoresScroll(pathKey(as)) ? NO_ANIMATION : undefined;
}

export function clearPendingTransition(as: string) {
  if (pending?.as === as) {
    pending = null;
  }
}

export const pagesCanTurn = () =>
  'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The sheet that turns shows half of each page, but a view transition captures every element once, so PageTurn prints
// its page a second time for it while a page turns. The turn is the one the sheet is shown for, or 0, and the owner
// tells apart the PageTurns of a page that turn on their own, like the lists of Find My Combos.
export interface TurningSheet {
  turn: number;
  owner?: string;
}

let turningSheet: TurningSheet = { turn: 0 };
let turnCount = 0;
const turningSheetListeners = new Set<(sheet: TurningSheet) => void>();

function setTurningSheet(sheet: TurningSheet) {
  turningSheet = sheet;
  turningSheetListeners.forEach((listener) => listener(sheet));
}

export function showTurningSheet(owner?: string) {
  turnCount += 1;
  setTurningSheet({ turn: turnCount, owner });
}

// A turn cut short by the next one only finishes once that one has shown its own sheet, which it must leave alone.
export function hideTurningSheet(turn = turningSheet.turn) {
  if (turn !== 0 && turn === turningSheet.turn) {
    setTurningSheet({ turn: 0 });
  }
}

export function getTurningSheet(): TurningSheet {
  return turningSheet;
}

export function subscribeTurningSheet(listener: (sheet: TurningSheet) => void): () => void {
  turningSheetListeners.add(listener);
  return () => {
    turningSheetListeners.delete(listener);
  };
}
