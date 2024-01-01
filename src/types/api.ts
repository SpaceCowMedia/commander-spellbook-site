export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type TemplateResponseType = {
  id: number
  name: string
  scryfallApi: string
  scryfallQuery: string
}
