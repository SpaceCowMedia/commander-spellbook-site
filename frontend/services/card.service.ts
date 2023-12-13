import requestService from "./request.service";

let cachedNames: string[] | null = null
const SCRYFALL_NAME_URL = 'https://api.scryfall.com/catalog/card-names'
const getCardNames = async (): Promise<string[]> => {
  if (cachedNames) return cachedNames
  const res = await requestService.get(SCRYFALL_NAME_URL)
  const data = res.data as string[]
  const processedNames = data.filter(n => !n.includes('A-')).map(n => n.split(' // ')[0])
  cachedNames = processedNames
  return processedNames
}

const CardService = {
  getCardNames
}

export default CardService
