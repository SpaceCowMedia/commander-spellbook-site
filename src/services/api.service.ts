import { GetServerSidePropsContext } from 'next';
import tokenService from './token.service';
import { Configuration, HTTPHeaders } from '@spacecowmedia/spellbook-client';

export function apiConfiguration(serverContext?: GetServerSidePropsContext) {
  const headers: HTTPHeaders = {};

  if (serverContext && serverContext.req.headers['x-forwarded-for']) {
    if (typeof serverContext.req.headers['x-forwarded-for'] === 'string') {
      headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'];
    }
    headers['x-forwarded-for'] = serverContext.req.headers['x-forwarded-for'][0];
  }
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
