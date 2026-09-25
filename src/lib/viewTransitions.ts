import type { NextPage } from 'next';
import type { NextRouter } from 'next/router';
import { queryParameterAsString } from './queryParameters';

export const PAGE_TURN_FORWARD = 'page-turn-forward';
export const PAGE_TURN_BACK = 'page-turn-back';
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
  return toPage > fromPage ? PAGE_TURN_FORWARD : PAGE_TURN_BACK;
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
