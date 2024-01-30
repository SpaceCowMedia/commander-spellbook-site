import { ScryfallCard } from "@scryfall/api-types";

export const getScryfallImage = (card: ScryfallCard.Any): string => {
  let imageUrl = ''
  if ('image_uris' in card) imageUrl = card.image_uris?.normal || ''
  else if ('card_faces' in card && 'image_uris' in card.card_faces[0]) imageUrl = card.card_faces[0].image_uris?.normal || ''
  return imageUrl
}
