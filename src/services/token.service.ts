import { GetServerSidePropsContext } from 'next';
import CookieService from './cookie.service';
import { getCookies } from 'cookies-next';
import { apiConfiguration } from './api.service';
import { ResponseError, TokenApi, TokenObtainPair } from '@space-cow-media/spellbook-client';

export function timeInSecondsToEpoch(): number {
  return Math.round(Date.now() / 1000);
}

export interface DecodedJWTType {
  user_id: number;
  username: string;
  email: string;
  orig_iat: string; // epoch time in seconds
  exp: number; // epoch time in seconds
  token_type?: string;
}

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

let pendingRefresh: Promise<string> | undefined;

// Every request made while the access token is expiring needs a new one, so they all wait on the same
// refresh instead of each sending its own, which would pile up requests just when the form is busiest.
function refreshClientToken(): Promise<string> {
  pendingRefresh ??= fetchNewToken(CookieService.get('csbRefresh'))
    .then((result) => setToken(result))
    .finally(() => {
      pendingRefresh = undefined;
    });
  return pendingRefresh;
}

async function getToken(): Promise<string> {
  const refreshToken = CookieService.get('csbRefresh') || null;
  const jwt = CookieService.get('csbJwt') || null;

  if (!jwt) {
    if (!refreshToken) {
      return '';
    } else {
      return refreshClientToken();
    }
  }

  const decodedToken = decodeJwt(jwt);
  const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

  if (!decodedToken) {
    return refreshClientToken();
  }

  if (decodedToken.exp > expirationCutoff) {
    CookieService.set('csbJwt', jwt, 'day');
    return jwt;
  }

  return refreshClientToken();
}

async function getTokenFromServerContext(serverContext?: GetServerSidePropsContext): Promise<string> {
  const cookies = await getCookies({ ...serverContext });
  const jwt = cookies?.csbJwt;
  const refreshToken = cookies?.csbRefresh;

  if (!jwt) {
    if (!refreshToken) {
      return Promise.resolve('');
    } else {
      const r = await fetchNewToken(refreshToken, serverContext);
      return setToken(r, serverContext);
    }
  }

  const decodedToken = decodeJwt(jwt);
  const expirationCutoff = timeInSecondsToEpoch() + 60; // within 60 seconds of expiration

  if (!decodedToken) {
    const result = await fetchNewToken(refreshToken, serverContext);
    return setToken(result, serverContext);
  }

  if (decodedToken.exp > expirationCutoff) {
    return jwt;
  }

  const result = await fetchNewToken(refreshToken, serverContext);
  return setToken(result, serverContext);
}

function setToken({ access, refresh }: TokenObtainPair, serverContext?: GetServerSidePropsContext) {
  const jwt = access;

  CookieService.set('csbJwt', jwt, 'day', {
    req: serverContext?.req,
    res: serverContext?.res,
  });
  if (refresh) {
    CookieService.set('csbRefresh', refresh, 'day', {
      req: serverContext?.req,
      res: serverContext?.res,
    });
  }

  return jwt;
}

// Only an expired or invalid refresh token ends the session. When the refresh is turned down for any
// other reason (too many requests, a server error, no connection) the refresh token is still good, so
// it is kept for the next attempt and the error reaches the caller, which can then report the actual
// problem and retry, instead of failing every request from then on as if the user had logged out.
function isRefreshTokenRejected(error: unknown): boolean {
  return error instanceof ResponseError && (error.response.status === 400 || error.response.status === 401);
}

async function fetchNewToken(
  refreshToken: string | undefined,
  serverContext?: GetServerSidePropsContext,
): Promise<TokenObtainPair> {
  const cookieOptions = {
    req: serverContext?.req,
    res: serverContext?.res,
  };

  if (!refreshToken) {
    CookieService.logout(cookieOptions);
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
  } catch (error) {
    if (!isRefreshTokenRejected(error)) {
      throw error;
    }
    CookieService.logout(cookieOptions);
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
