import { getFaceNames } from 'lib/types';

const TCGPLAYER_AFFILIATE_URL = 'https://partner.tcgplayer.com/c/4913290/1830156/21018?partnerpropertyid=5237567';
const CARD_KINGDOM_PARTNER_PARAMETERS =
  'partner=CommanderSpellbook&utm_source=edhrec&utm_medium=commanderspellbook&utm_campaign=edhrec';

const tcgPlayerAffiliateUrl = (destination: string, subId: string) =>
  `${TCGPLAYER_AFFILIATE_URL}&subId1=${encodeURIComponent(subId)}&u=${encodeURIComponent(destination)}`;

const massEntryList = (cards: string[]) => encodeURIComponent(cards.map((card) => `1 ${card}`).join('||'));

const frontFace = (cardName: string) => encodeURIComponent(getFaceNames(cardName)[0]);

const getComboTcgPlayerUrl = (cards: string[]) =>
  tcgPlayerAffiliateUrl(`https://store.tcgplayer.com/massentry?c=${massEntryList(cards)}`, 'csb,buyThisCombo');

const getComboCardKingdomUrl = (cards: string[]) =>
  `https://www.cardkingdom.com/builder?${CARD_KINGDOM_PARTNER_PARAMETERS}&c=${massEntryList(cards)}`;

const getCardTcgPlayerUrl = (cardName: string) =>
  tcgPlayerAffiliateUrl(
    `https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=${frontFace(cardName)}`,
    'csb,buyThisCard',
  );

const getCardCardKingdomUrl = (cardName: string) =>
  `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=${frontFace(cardName)}&${CARD_KINGDOM_PARTNER_PARAMETERS}`;

const VendorsService = {
  getComboTcgPlayerUrl,
  getComboCardKingdomUrl,
  getCardTcgPlayerUrl,
  getCardCardKingdomUrl,
};

export default VendorsService;
