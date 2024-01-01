import { GetServerSidePropsContext } from 'next'

import CookieService from './cookie.service'

import { Cookies } from 'react-cookie'
import tokenService from "./token.service";

const proxiedUrls = {
  '/api': `${process.env.EDITOR_BACKEND_URL}`,
}

type GetArgs = []
export type Get = <T = any>(...args: GetArgs) => Promise<T>

type PostArgs = [string, Record<string, any>, RequestInit?, boolean?]
export type Post = <T = any>(...args: PostArgs) => Promise<T>
export class RequestService {
  serverContext: GetServerSidePropsContext | null
  cookies: { get: (key: string) => any }

  constructor(serverContext?: GetServerSidePropsContext) {
    this.serverContext = serverContext || null
    this.cookies = this.serverContext ? new Cookies(this.serverContext.req.cookies) : CookieService
  }

  private async getJwt() {
    if (this.serverContext) return tokenService.getTokenFromServerContext(this.serverContext)

    return tokenService.getToken()
  }

  /**
   * Checks the front of the user supplied URL and changes the font of it to use our API_HOST
   * If the supplied URL doesn't match any of our proxies, return the provided URL
   */
  private replaceUrl(userUrl: string): string {
    let replacementUrl: string | null = null

    const proxy: string | undefined = Object.keys(proxiedUrls).find(key => {
      if (userUrl.startsWith(key)) return true
      return false
    })

    if (!proxy) return userUrl
    if (proxy === '/api') replacementUrl = proxiedUrls['/api']

    // prettier-ignore
    if (proxy === '/api' && process.env.NEXT_PUBLIC_NODE_ENV === 'production' && this.serverContext) replacementUrl = `${process.env.SERVER_URL}/api`

    if (!replacementUrl) return userUrl

    return userUrl.replace(proxy, replacementUrl)
  }

  private handleResponse = (res: Response) => {
    const body = res.json().catch(this.handleError)

    if (res.ok) return body

    return body.then(err => {
      if (typeof err === 'string') throw err

      err.statusCode = res.status

      throw err
    })
  }

  private handleNonJsonResponse = (res: Response) => {
    const text = res.text().catch(this.handleError)

    if (res.ok) return text

    return text.then(err => {
      throw err
    })
  }

  private handleError = (err: Error) => {
    // TODO report error
    if (!this.serverContext) console.error(err)

    throw err
  }

  private fetchWrapper(url: string, request: any, nonJsonRequest?: boolean, skipProxy?: boolean) {
    const userProxyInfo = this.serverContext?.req.headers['x-forwarded-for'] || undefined

    if (this.serverContext && userProxyInfo && !skipProxy) request.headers['x-forwarded-for'] = userProxyInfo

    if (nonJsonRequest) return fetch(url, request).then(this.handleNonJsonResponse).catch(this.handleError)

    return fetch(url, request).then(this.handleResponse).catch(this.handleError)
  }

  async get<T = any>(url: string, options: RequestInit = {}, unauthenticated = false): Promise<T> {
    const proxy = this.replaceUrl(url)

    const request: any = {
      method: 'GET',
      headers: { 'accept': 'application/json' },
      ...options, // Provieds users a way to override everything
    }

    if (!unauthenticated) {
      const token = await this.getJwt()
      if (token) request.headers['authorization'] = `Bearer ${token}`
    }

    return this.fetchWrapper(proxy, request)
  }

  async post<T = any>(
    url: string,
    body: Record<string, any>,
    options: RequestInit = {},
    unauthenticated = false,
  ): Promise<T> {
    const proxy = this.replaceUrl(url)

    const request: any = {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(body),
      ...options,
    }

    if (!unauthenticated) {
      const token = await this.getJwt()
      if (token) request.headers['authorization'] = `Bearer ${token}`
    }
    return this.fetchWrapper(proxy, request)
  }

  async put<T = any>(url: string, body: Record<string, any>, options: RequestInit = {}): Promise<T> {
    const token = await this.getJwt()
    const proxy = this.replaceUrl(url)

    return this.fetchWrapper(proxy, {
      method: 'PUT',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
      ...options,
    })
  }

  async patch<T = any>(url: string, body: Record<string, any>, options: RequestInit = {}): Promise<T> {
    const token = await this.getJwt()
    const proxy = this.replaceUrl(url)

    return this.fetchWrapper(proxy, {
      method: 'PATCH',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
      ...options,
    })
  }

  async delete<T = any>(url: string, options: RequestInit = {}, noJsonSerialization = false): Promise<T> {
    const authToken = await this.getJwt()
    const proxy = this.replaceUrl(url)

    return this.fetchWrapper(
      proxy,
      {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Bearer ${authToken}`,
        },
        ...options,
      },
      noJsonSerialization,
    )
  }

  async upload<T = any>(url: string, file: File, options: RequestInit = {}): Promise<T> {
    const token = await this.getJwt()
    const proxy = this.replaceUrl(url)

    return this.fetchWrapper(proxy, {
      method: 'PUT',
      headers: {
        // accept: 'application/json',
        // 'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        'Content-Disposition': 'attachment; filename="' + file.name + '"', // not sure what this does, but our api is expecting it for some endpoints
      },
      body: file,
      ...options,
    })
  }

  async formPost<T = any>(
    url: string,
    body: Record<string, any>,
    options: RequestInit = {},
    unauthenticated = false,
  ): Promise<T> {
    const proxy = this.replaceUrl(url)
    const formData = new FormData()

    for (const name in body) {
      if (Array.isArray(body[name])) {
        for (let i = 0; i < body[name].length; i++) {
          formData.append(`${name}[${i}]`, body[name][i])
        }
      } else {
        formData.append(name, body[name])
      }
    }

    const request: any = {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: formData,
      ...options,
    }

    if (!unauthenticated) {
      const authToken = await this.getJwt()
      if (authToken) request.headers['authorization'] = `Bearer ${authToken}`
    }

    return this.fetchWrapper(proxy, request)
  }

  getFile(url: string): Promise<string> {
    return this.fetchWrapper(url, {}, true, true)
  }
}

const requestService = new RequestService()

export default requestService
