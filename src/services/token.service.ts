import { GetServerSidePropsContext } from 'next';
import CookieService from './cookie.service';
import { getCookies } from 'cookies-next';
import { apiConfiguration } from './api.service';
import { TokenApi, TokenObtainPair } from '@space-cow-media/spellbook-client';

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

function decodeJwt(jwt?: string): DecodedJWTType | null {
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

  if (!jwt) {
    if (!refreshToken) {
      return '';
    } else {
      const result = await fetchNewToken();
      return setToken(result);
    }
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

async function getTokenFromServerContext(serverContext?: GetServerSidePropsContext): Promise<string> {
  const cookies = await getCookies({ ...serverContext });
  const jwt = cookies?.csbJwt;
  const refreshToken = cookies?.csbRefresh;

  if (!jwt) {
    if (!refreshToken) {
      return Promise.resolve('');
    } else {
      const r = await fetchNewToken(refreshToken);
      return setToken(r, serverContext);
    }
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

function setToken({ access, refresh }: TokenObtainPair, serverContext?: GetServerSidePropsContext) {
  const jwt = access;

  CookieService.set('csbJwt', jwt, 'day', { req: serverContext?.req, res: serverContext?.res });
  if (refresh) {
    CookieService.set('csbRefresh', refresh, 'day', { req: serverContext?.req, res: serverContext?.res });
  }

  return jwt;
}

async function fetchNewToken(
  providedRefreshToken?: string,
  serverContext?: GetServerSidePropsContext,
): Promise<TokenObtainPair> {
  const refreshToken = providedRefreshToken
    ? providedRefreshToken
    : CookieService.get('csbRefresh', { req: serverContext?.req, res: serverContext?.res }) || null;

  if (!refreshToken) {
    CookieService.logout();
    return { access: '', refresh: '' };
  }

  const configuration = apiConfiguration(serverContext);
  const tokensApi = new TokenApi(configuration);

  try {
    const response = await tokensApi.tokenRefreshCreate({
      tokenRefreshRequest: {
        refresh: refreshToken,
      },
    });
    return {
      refresh: refreshToken,
      ...response,
    };
  } catch (_err) {
    CookieService.logout();
    return { access: '', refresh: '' };
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
