import { getFaceNames } from 'lib/types';

const getCardUrl = (cardName: string) =>
  `https://gatherer.wizards.com/search?searchTerm=${encodeURIComponent(getFaceNames(cardName)[0])}`;

const GathererService = {
  getCardUrl,
};

export default GathererService;
