import { Variant } from '@spacecowmedia/spellbook-client';

const getComboUrl = (variant: Variant) => {
  return `https://edhrec.com/combos/${variant.identity.toLowerCase()}/${variant.id}`;
};

const getCardUrl = (cardName: string) => {
  const normalizedName = cardName
    .split(' // ')[0]
    .normalize('NFD')
    .toLowerCase()
    .replaceAll(/[^a-zA-Z0-9-_+\s/]/g, '')
    .replaceAll(/\+/g, 'plus ')
    .replaceAll(/[\s/]+/g, '-');

  return `https://edhrec.com/cards/${normalizedName}`;
};

const EDHRECService = {
  getComboUrl,
  getCardUrl,
};

export default EDHRECService;
