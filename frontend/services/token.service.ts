import { GetServerSidePropsContext, NextPageContext } from 'next'

import CookieService from './cookie.service'

export function timeInSecondsToEpoch(): number {
  return Math.round(Date.now() / 1000)
}

export type DecodedJWTType = {
  user_id: number
  username: string
  email: string
  orig_iat: string // epoch time in seconds
  exp: number // epoch time in seconds
  token_type?: string
}

type RefreshResponse = {
  refresh: string
  access: string
}

function decodeJwt(jwt: string): DecodedJWTType | null {
  if (!jwt) return null

  const base64Url = jwt.split('.')[1]

  if (!base64Url) return null

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

function getToken(): Promise<string> {
  const refreshToken = CookieService.get('csbRefresh') || null
  const jwt = CookieService.get('csbJwt') || null

  if (!jwt && !refreshToken) return Promise.resolve('')
  if (!jwt && refreshToken) return fetchNewToken().then(setToken)

  const decodedToken = decodeJwt(jwt)
  const expirationCutoff = timeInSecondsToEpoch() + 60 // within 60 seconds of expiration

  if (!decodedToken) return fetchNewToken().then(setToken)
  if (decodedToken.exp > expirationCutoff) {
    CookieService.set('csbJwt', jwt)

    return jwt
  }

  return fetchNewToken().then(setToken)

}

function getTokenFromServerContext(
  serverContext?: GetServerSidePropsContext,
  pageContext?: NextPageContext,
) {
  const jwt = CookieService.get('csbJwt', serverContext?.req.cookies || pageContext?.req?.headers?.cookie)
  const refreshToken = CookieService.get('csbRefresh', serverContext?.req.cookies || pageContext?.req?.headers?.cookie)

  if (!jwt && !refreshToken) return ''
  if (!jwt && refreshToken) return fetchNewToken(refreshToken).then(setToken)
  if (!jwt) return

  const decodedToken = decodeJwt(jwt)
  const expirationCutoff = timeInSecondsToEpoch() + 60 // within 60 seconds of expiration

  if (!decodedToken) return fetchNewToken(refreshToken).then(setToken)
  if (decodedToken.exp > expirationCutoff) {
    CookieService.set('csbJwt', jwt)

    return jwt
  }

  return fetchNewToken(refreshToken).then(setToken)
}

function setToken({ access, refresh }: RefreshResponse) {
  const jwt = access

  CookieService.set('csbJwt', jwt)
  if (refresh) CookieService.set('csbRefresh', refresh)

  return jwt
}
function fetchNewToken(providedRefreshToken?: string) {
  const refreshToken = providedRefreshToken ? providedRefreshToken : CookieService.get('csbRefresh') || null

  console.log('fetching new token')
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })
    .then(response => {
      if (!response.ok) throw new Error('Refresh fetch failed')
      return response.json()
    })
    .catch(err => {
      CookieService.logout()

      return ''
    })
}


const TokenService = {
  getToken,
  getTokenFromServerContext,
  decodeJwt,
  setToken,
  fetchNewToken,
}

export default TokenService
