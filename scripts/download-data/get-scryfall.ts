/* eslint-disable camelcase */
import getData from "../shared/get";
import log from "../shared/log";
import normalizeCardName from "../../lib/normalize-card-name";

type BulkDataApiResponse = {
  data: Array<{
    type: string;
    download_uri: string;
  }>;
};
type RawScryfallResponse = Array<{
  object: "card";
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  mtgo_id: number;
  mtgo_foil_id: number;
  tcgplayer_id: number;
  cardmarket_id: number;
  name: string;
  card_faces?: Array<{
    // TODO fill in the rest of this if necessary
    image_uris: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }>;
  lang: "en";
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  legalities: {
    standard: string;
    future: string;
    historic: string;
    gladiator: string;
    pioneer: string;
    modern: string;
    legacy: string;
    pauper: string;
    vintage: string;
    penny: string;
    commander: string;
    brawl: string;
    duel: string;
    oldschool: string;
    premodern: string;
  };
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  flavor_text: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank: number;
  prices: {
    usd: string;
    usd_foil: string;
    eur: string;
    eur_foil: string;
    tix: string;
  };
  related_uris: {
    gatherer: string;
    tcgplayer_infinite_articles: string;
    tcgplayer_infinite_decks: string;
    edhrec: string;
    mtgtop8: string;
  };
}>;
type ScryfallData = Record<
  string,
  {
    setData: {
      reprint: boolean;
      setCode: string;
    };
    images: {
      oracle: string;
      artCrop: string;
    };
    isBanned: boolean;
    isPreview: boolean;
    edhrecPermalink: string;
  }
>;

export default async function getScryfallData(): Promise<ScryfallData> {
  log("Fetching Scryfall Bulk Data URI");

  const response = (await getData(
    "https://api.scryfall.com/bulk-data"
  )) as BulkDataApiResponse;
  const oracleCardsUrl =
    response.data.find(({ type }) => {
      return type === "oracle_cards";
    })?.download_uri || "";

  log(`Downloading bulk data from ${oracleCardsUrl}`);
  const bulkData = (await getData(oracleCardsUrl)) as RawScryfallResponse;
  log("Finding Scryfall Images");

  const data = bulkData.reduce((cards, card) => {
    if (
      card.set_type === "funny" ||
      card.set_type === "token" ||
      card.set_type === "memorabilia"
    ) {
      // skip tokens, art cards, silver bordered stuff
      return cards;
    }
    // TODO during preview season, the cards sometimes do not have English
    // prints yet, which is a problem for reprint cards since those non-English
    // prints become the default card image on Scryfall's side. To mitigate this,
    // we will need to check _if_ it's a reprint and if it was previwed in the last
    // week. If both of those things are true, we should look for a better print.
    // Criteria for the better print is:
    // * not a preview
    // * not oversized
    // * not a promo
    // * not textless
    // * not full art
    // * available in nonfoil
    // * available in English
    // * not a special treatment (gonna be hard to narrow this down, may have to ignore this bit)
    // If those criteria can't be found, just use the original preview image
    let images = card.image_uris;

    if (!images) {
      // double sided card, split card, etc
      images = card.card_faces && card.card_faces[0].image_uris;

      if (!images) {
        log(`${card.name} missing images. Reach out to Scryfall.`, "red");
        return cards;
      }
    }
    const isFromUpcomingSet =
      !card.reprint && new Date(card.released_at) > new Date();
    cards[normalizeCardName(card.name)] = {
      setData: {
        reprint: card.reprint,
        setCode: card.set,
      },
      images: {
        oracle: images.normal,
        artCrop: images.art_crop,
      },
      isBanned: card.legalities.commander === "banned",
      isPreview: isFromUpcomingSet,
      edhrecPermalink: card.related_uris.edhrec,
    };

    return cards;
  }, {} as ScryfallData);

  return data;
}
