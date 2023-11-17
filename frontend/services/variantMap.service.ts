
const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
let cachedVariantMap: Record<string, string> | null = null
const getVariantMap = async (): Promise<Record<string, string>> => {
  if (cachedVariantMap) return Promise.resolve(cachedVariantMap)
  const fetchedData = await fetch(ID_MAP_URL).then(res => res.json())
  cachedVariantMap = fetchedData
  return fetchedData
}

export {
  getVariantMap
}
