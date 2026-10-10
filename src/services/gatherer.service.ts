import { getFaceNames } from 'lib/card/faces';

const getCardUrl = (cardName: string) =>
  `https://gatherer.wizards.com/search?searchTerm=${encodeURIComponent(getFaceNames(cardName)[0])}`;

const GathererService = {
  getCardUrl,
};

export default GathererService;
