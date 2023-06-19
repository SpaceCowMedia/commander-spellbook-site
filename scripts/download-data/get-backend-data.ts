import type {CompressedApiResponse, VariantBulkData, Variant, NewPrerequisiteType} from "../../frontend/lib/types";
import getData from "../shared/get";
import log from "../shared/log";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
const VARIANT_DATA_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variants.json'

const invert = (input: Record<string, string>) => {
  let counter = 0
  const output: Record<string, string> = {}
  for (const key in input) {
    if (output[input[key]]) counter++
    output[input[key]] = key
  }
  log(`Ignore ${counter} duplicate keys`)
  return output
}

const ZONE_MAP = {
  "H": "in hand",
  "B": "on the battlefield",
  "C": "in the command zone",
  "G": "in your graveyard",
  "L": "in your library",
  "E": "in exile",
}

const getPrerequisiteList = (variant: Variant): NewPrerequisiteType[] => {
  let output: NewPrerequisiteType[] = []

  // Handle any multi-zone cards
  const multiZoneCards = variant.uses.filter(card => card.zoneLocations.length > 1)
  for (const card of multiZoneCards.sort((a, b) => a.card.name.localeCompare(b.card.name))) {
    let cardString = ''
    cardString += `${card.card.name} `
    cardString += card.zoneLocations.map(zone => ZONE_MAP[zone as keyof typeof ZONE_MAP]).join(' or ')
    if (card.cardState) cardString += ` (${card.cardState})`
    cardString += ". "
    output.push({z: 'multi', s: cardString})
  }
  const singleZoneCards = variant.uses.filter(card => card.zoneLocations.length === 1)

  const zoneGroups: {cardNames: string[], cardState: string, zone: keyof typeof ZONE_MAP}[] = []

  // Sort cards into groups by zone
  for (const zoneKey in ZONE_MAP) {
    const zoneCards = singleZoneCards.filter(card => card.zoneLocations[0] === zoneKey)
    if (zoneCards.length === 0) continue
    let cardState = zoneCards
      .filter(card => card.cardState)
      .map(card => `${zoneCards.length > 1 ? `${card.card.name} ` : ''}${card.cardState}`)
      .join(', ')
    if (cardState) cardState = ` (${cardState})`
    zoneGroups.push({
      cardNames: zoneCards.map(card => card.card.name),
      zone: zoneKey as keyof typeof ZONE_MAP,
      cardState,
    })
  }

  let index = 0
  for (const zoneGroup of zoneGroups.sort((a,b) => a.cardNames.length > b.cardNames.length ? 1 : -1 )) {
    const cards = zoneGroup.cardNames
    // If this is the last zone group, and it has more than 2 cards, swap card names for combinations string
    if (index === zoneGroups.length - 1 && cards.length > 2) {
      output.push({
        z: zoneGroup.zone,
        s: `All${zoneGroups.length + multiZoneCards.length > 1 ? ' other' : ''} ${zoneGroup.zone === 'B' ? 'permanents' : 'cards'} ${ZONE_MAP[zoneGroup.zone]}${zoneGroup.cardState}`
      })
    }
    else {
      // Otherwise just list the cards
      output.push({
        z: zoneGroup.zone,
        s: (cards.length < 3 ? cards.join(' and ') : cards.slice(0, -1).join(', ') + ' and ' + cards.slice(-1)) + ' ' + ZONE_MAP[zoneGroup.zone] + zoneGroup.cardState
      })
    }
    index++
  }

  // Add any other prerequisites
  if (variant.otherPrerequisites) variant.otherPrerequisites.split('. ').forEach(prereq => output.push({z: 'other', s: prereq}))
  if (variant.manaNeeded) output.push({z: 'mana', s: `${variant.manaNeeded} available`})

  return output
}

const getPrerequisiteString = (variant: Variant) => {
  let output = ""
  for (const card of variant.uses.sort((a, b) => a.card.name.localeCompare(b.card.name))) {
    output += `${card.card.name} `
    output += card.zoneLocations.map(zone => ZONE_MAP[zone as keyof typeof ZONE_MAP]).join(' or ')
    output += ". "
  }
  output += (variant.otherPrerequisites || "")
  output += variant.manaNeeded ? `${variant.manaNeeded} available. ` : ``
  return output
}


export default async function getBackendData(): Promise<CompressedApiResponse[]> {
  log("Fetching Combo data from backend bucket");
  const variantData = await getData(VARIANT_DATA_URL) as VariantBulkData
  log(`Found ${variantData.variants.length} variants in the backend bucket.`);
  const reverseIdMap = await getData(ID_MAP_URL) as Record<string, string>
  log(`Found ${Object.keys(reverseIdMap).length} ids in the id map.`)
  const idMap = invert(reverseIdMap)
  const output: CompressedApiResponse[] = []
  for (const variant of variantData.variants) {
    const compressedVariant: CompressedApiResponse = {
      d : idMap[variant.id],
      c : variant.uses.sort((a, b) => a.card.name.localeCompare(b.card.name)).map(card => card.card.name),
      i : variant.identity.toLowerCase().split("").join(','),
      t : getPrerequisiteList(variant),
      p : getPrerequisiteString(variant),
      s : variant.description,
      r : variant.produces.map(feature => feature.name).join('. '),
      b : variant.legal ? 0 : 1,
      o : variant.spoiler ? 1 : 0
    }
    output.push(compressedVariant)
  }
  return output
}
