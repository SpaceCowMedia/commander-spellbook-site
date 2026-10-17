import pluralize from 'pluralize';
import EDHRECService from 'services/edhrec.service';
import { scryfallCardUrl } from 'services/scryfall.service';
import { comboTitleToText } from 'components/combo/CardHeader/CardHeader';
import { absoluteUrl, formatCount, formatList, truncateDescription, websiteJsonLd, withSiteName } from 'lib/seo';
import { CardPageProps } from './cardPageData';

const JSON_LD_COMBOS = 10;

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function cardCanonicalPath(card: CardPageProps['card']): string {
  return `/card/${card.id || card.oracleId}/`;
}

export function cardTitle({ card, combosCount }: CardPageProps): string {
  return withSiteName(combosCount > 0 ? `${card.name} Combos` : card.name);
}

export function cardSummary({ card, combosCount, formatTerm, results, partners }: CardPageProps): string {
  if (combosCount === 0) {
    return `${card.name} (${card.typeLine}): rules text, legality, prices and the combo roles it can fill.`;
  }
  const legality = formatTerm === 'legal:commander' ? ' legal in Commander' : '';
  const sentences = [
    `${card.name} is part of ${formatCount(combosCount)} ${pluralize('combo', combosCount)}${legality}`,
  ];
  if (results.length > 0) {
    sentences[0] += `, for ${formatList(results.slice(0, 3).map((result) => lowerFirst(result.name)))}`;
  }
  if (partners.length > 0) {
    sentences.push(`Often combined with ${formatList(partners.slice(0, 2).map((partner) => partner.card.name))}`);
  }
  return sentences.map((sentence) => `${sentence}.`).join(' ');
}

export function cardDescription(props: CardPageProps): string {
  return truncateDescription(cardSummary(props));
}

export function cardImagePath(card: CardPageProps['card']): string {
  return `/api/card/${card.id || card.oracleId}/generate-image/`;
}

export function cardJsonLd(props: CardPageProps) {
  const { card, combos, combosCount } = props;
  const url = absoluteUrl(cardCanonicalPath(card));
  return {
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name: cardTitle(props),
    description: cardDescription(props),
    inLanguage: 'en',
    isPartOf: websiteJsonLd(),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: absoluteUrl(cardImagePath(card)),
      width: 1200,
      height: 630,
    },
    about: {
      '@type': 'Thing',
      name: card.name,
      description: card.oracleText || undefined,
      image: card.imageUriFrontLarge ?? undefined,
      sameAs: [EDHRECService.getCardUrl(card.name), scryfallCardUrl(card.name)],
    },
    mainEntity:
      combosCount > 0
        ? {
            '@type': 'ItemList',
            name: `Combos with ${card.name}`,
            numberOfItems: combosCount,
            itemListElement: combos.slice(0, JSON_LD_COMBOS).map((combo, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(`/combo/${combo.id}/`),
              name: comboTitleToText(combo.uses, combo.requires, ' + '),
            })),
          }
        : undefined,
  };
}
