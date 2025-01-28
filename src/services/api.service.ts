import { GetServerSidePropsContext } from 'next';
import CookieService from './cookie.service';
import { Cookies } from 'react-cookie';
import tokenService from './token.service';
import { Configuration, HTTPHeaders } from '@space-cow-media/spellbook-client';

export function apiConfiguration(serverContext?: GetServerSidePropsContext) {
  const _cookies = serverContext ? new Cookies(serverContext.req.cookies) : CookieService;

  const headers: HTTPHeaders = {};
  if (serverContext && serverContext.req.headers['x-forwarded-for']) {
    if (typeof serverContext.req.headers['x-forwarded-for'] === 'string') {
      headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'];
    }
    headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'][0];
  }

  // TODO: refactor to get jwt from cookies
  return new Configuration({
    basePath: process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL,
    accessToken: function (_name?: string, _scopes?: string[]) {
      if (serverContext) {
        return tokenService.getTokenFromServerContext(serverContext);
      }
      return tokenService.getToken();
    },
    headers: headers,
  });
}
