import { GetServerSidePropsContext, NextPageContext } from 'next';
import CookieService from './cookie.service';
import { Cookies } from 'react-cookie';

export function timeInSecondsToEpoch(): number {
  return Math.round(Date.now() / 1000);
}

export type DecodedJWTType = {
  user_id: number;
  username: string;
  email: string;
  orig_iat: string; // epoch time in seconds
  exp: number; // epoch time in seconds
  token_type?: string;
};

type RefreshResponse = {
  refresh: string;
  access: string;
};

function decodeJwt(jwt: string): DecodedJWTType | null {
  if (!jwt) {
    return null;
  }

  const base64Url = jwt.split('.')[1];

  if (!base64Url) {
    return null;
  }

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

async function getToken(): Promise<string> {
  const refreshToken = CookieService.get('csbRefresh') || null;
  const jwt = CookieService.get('csbJwt') || null;

  if (!jwt && !refreshToken) {
    return '';
  }

  if (!jwt && refreshToken) {
    const result = await fetchNewToken();
    return setToken(result);
  }

  const decodedToken = decodeJwt(jwt);
  const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

  if (!decodedToken) {
    const result = await fetchNewToken();
    return setToken(result);
  }

  if (decodedToken.exp > expirationCutoff) {
    CookieService.set('csbJwt', jwt, 'day');
    return jwt;
  }

  const result = await fetchNewToken();
  return setToken(result);
}

async function getTokenFromServerContext(
  serverContext?: GetServerSidePropsContext,
  pageContext?: NextPageContext,
): Promise<string> {
  const jwt = CookieService.get('csbJwt', serverContext?.req.cookies || pageContext?.req?.headers?.cookie);
  const refreshToken = CookieService.get('csbRefresh', serverContext?.req.cookies || pageContext?.req?.headers?.cookie);

  if (!jwt && !refreshToken) {
    return Promise.resolve('');
  }

  if (!jwt && refreshToken) {
    const r = await fetchNewToken(refreshToken);
    return setToken(r, serverContext);
  }

  const decodedToken = decodeJwt(jwt);
  const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

  if (!decodedToken) {
    const result = await fetchNewToken(refreshToken);
    return setToken(result, serverContext);
  }

  if (decodedToken.exp > expirationCutoff) {
    return jwt;
  }

  const result = await fetchNewToken(refreshToken);
  return setToken(result, serverContext);
}

function setToken({ access, refresh }: RefreshResponse, serverContext?: GetServerSidePropsContext) {
  const jwt = access;

  const cookies = new Cookies();
  CookieService.set('csbJwt', jwt, 'day', cookies);
  if (refresh) {
    CookieService.set('csbRefresh', refresh, 'day', cookies);
  }
  const cookiesDict = cookies.getAll() as Record<string, string>;
  const cookieValues = [];
  for (const key in cookiesDict) {
    cookieValues.push(`${key}=${cookiesDict[key]}; Path=/; Max-Age={expirationDurations.day}; SameSite=Strict`);
    serverContext?.res.setHeader('Set-Cookie', cookieValues);
  }

  return jwt;
}

async function fetchNewToken(providedRefreshToken?: string) {
  // TODO: use spellbook client to fetch new token
  const refreshToken = providedRefreshToken ? providedRefreshToken : CookieService.get('csbRefresh') || null;

  console.log('fetching new token');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) {
      throw new Error('Refresh fetch failed');
    }
    return response.json();
  } catch (err) {
    CookieService.logout();
    return '';
  }
}

const TokenService = {
  getToken,
  getTokenFromServerContext,
  decodeJwt,
  setToken,
  fetchNewToken,
};

export default TokenService;
