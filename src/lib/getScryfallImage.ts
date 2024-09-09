import { ScryfallCard } from '@scryfall/api-types';

export const getScryfallImage = (card: ScryfallCard.Any): string[] => {
  if ('image_uris' in card) return [card.image_uris?.normal || ''];
  else if ('card_faces' in card) {
    let result = [];
    for (let face of card.card_faces) {
      if ('image_uris' in face) result.push(face.image_uris?.normal || '');
    }
    return result;
  }
  return [''];
};
