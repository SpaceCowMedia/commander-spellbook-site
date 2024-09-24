import { NextPageContext } from 'next';
import Cookies from 'universal-cookie';

export const expirationDurations = {
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
};

export function get<T = any>(path: string, serverCookies?: Record<string, any> | string): T {
  const cookies = new Cookies(serverCookies);

  // @ts-ignore
  const result = cookies.get(path, { path: '/' });

  return result as T;
}

export function set(key: string, value: any, age?: keyof typeof expirationDurations, cookies?: Cookies) {
  const cookiesInstance = cookies ?? new Cookies();

  const maxAge = age ? expirationDurations[age] : undefined;

  cookiesInstance.set(key, value, {
    path: '/',
    maxAge,
    sameSite: 'strict',
    httpOnly: false,
  });
}

export function remove(key: string) {
  const cookies = new Cookies();

  cookies.remove(key, { path: '/' });
}

export function logout() {
  remove('csbRefresh');
  remove('csbJwt');
  remove('csbUsername');
  remove('csbUserId');
}

export function serverLogout(ctx: NextPageContext) {
  ctx.res?.setHeader('Set-Cookie', [
    'csbRefresh=deleted; path=/; Max-Age=0',
    'csbJwt=deleted; path=/; Max-Age=0',
    'csbUsername=deleted; path=/; Max-Age=0',
    'csbUserId=deleted; path=/; Max-Age=0',
  ]);
}

const cookieService = {
  get,
  set,
  remove,
  logout,
  serverLogout,
};

export default cookieService;
