const ID_MAP_URL = 'https://json.commanderspellbook.com/variant_id_map.json';

let cachedLegacyMap: Record<string, string> | null = null;

const fetchLegacyMap = async () => {
  if (cachedLegacyMap) {
    return cachedLegacyMap;
  }
  const response = await fetch(ID_MAP_URL);
  const legacyMap: Record<string, string> = await response.json();
  cachedLegacyMap = legacyMap;
  return legacyMap;
};

const BulkApiService = {
  fetchLegacyMap,
};

export default BulkApiService;
