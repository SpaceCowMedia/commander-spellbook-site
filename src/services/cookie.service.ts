import { deleteCookie, getCookie, OptionsType, setCookie } from 'cookies-next';

export const expirationDurations = {
  hour: 3600,
  hours: 10800,
  day: 86400,
  week: 604800,
  month: 2592000,
  year: 31536000,
};

export function get<T = string>(path: string, options?: OptionsType): T | undefined {
  // @ts-ignore
  const result = getCookie(path, { path: '/', ...options });

  return result as T;
}

export function set(key: string, value: any, age?: keyof typeof expirationDurations, options?: OptionsType) {
  const maxAge = age ? expirationDurations[age] : undefined;

  setCookie(key, value, {
    path: '/',
    maxAge,
    sameSite: 'strict',
    httpOnly: false,
    ...options,
  });
}

export function remove(key: string, options?: OptionsType) {
  deleteCookie(key, { path: '/', ...options });
}

export function logout() {
  remove('csbRefresh');
  remove('csbJwt');
  remove('csbUsername');
  remove('csbUserId');
  remove('csbIsStaff');
}

const CookieService = {
  get,
  set,
  remove,
  logout,
};

export default CookieService;
