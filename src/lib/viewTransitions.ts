import type { NextPage } from 'next';
import type { NextRouter } from 'next/router';
import { queryParameterAsString } from './queryParameters';

export const PAGE_SLIDE_FORWARD = 'page-slide-forward';
export const PAGE_SLIDE_BACK = 'page-slide-back';
export const PAGE_FLIP_FORWARD = 'page-flip-forward';
export const PAGE_FLIP_BACK = 'page-flip-back';
export const PAGE_TURNS = [PAGE_SLIDE_FORWARD, PAGE_SLIDE_BACK, PAGE_FLIP_FORWARD, PAGE_FLIP_BACK];
export const NO_ANIMATION = 'no-animation';
export const WHEEL_NEXT = 'wheel-next';
export const WHEEL_PREVIOUS = 'wheel-previous';

const NO_ANIMATION_PATHS = new Set(['/find-my-combos']);

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

// Pages 1 and 2, 3 and 4, … are the two sides of a spread: a page slides to the other side of its spread and flips
// over to the next spread.
export function pageTurn(fromPage: number, toPage: number): string {
  const slide = Math.min(fromPage, toPage) % 2 === 1;
  if (toPage > fromPage) {
    return slide ? PAGE_SLIDE_FORWARD : PAGE_FLIP_FORWARD;
  }
  return slide ? PAGE_SLIDE_BACK : PAGE_FLIP_BACK;
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
  return NO_ANIMATION_PATHS.has(pathKey(as)) ? NO_ANIMATION : undefined;
}

export function clearPendingTransition(as: string) {
  if (pending?.as === as) {
    pending = null;
  }
}
