import pluralize from 'pluralize';
import { Variant } from '@space-cow-media/spellbook-client';
import { comboTitleToText } from './CardHeader/CardHeader';
import { BRACKET_NAME_MAP, BRACKET_RANGE_MAP } from 'lib/brackets';
import { cardPath } from 'lib/cards';
import { countNotablePrerequisites } from 'lib/prerequisitesProcessor';
import { absoluteUrl, formatList, truncateDescription, websiteJsonLd, withSiteName } from 'lib/seo';

export function comboCanonicalPath(combo: Variant): string {
  return `/combo/${combo.id}/`;
}

export function comboImageUrl(combo: Variant): string {
  return absoluteUrl(`/api/combo/${combo.id}/generate-image/`);
}

export function comboName(combo: Variant): string {
  return `${comboTitleToText(combo.uses, combo.requires, ' + ')} Combo`;
}

export function comboTitle(combo: Variant): string {
  return withSiteName(comboName(combo));
}

export function comboDescription(combo: Variant, results: string[], stepCount: number): string {
  const cards = combo.uses.map(({ card }) => card.name);
  const generic = combo.requires.reduce((count, template) => count + template.quantity, 0);
  const ingredients = generic > 0 ? [...cards, pluralize('generic card', generic, true)] : cards;
  const prerequisites = countNotablePrerequisites(combo);
  const sentences = [
    results.length > 0
      ? `${formatList(results)} with ${formatList(ingredients)}`
      : `Combo of ${formatList(ingredients)}`,
    combo.legalities.commander ? '' : 'Banned in Commander',
    stepCount > 0
      ? `${pluralize('step', stepCount, true)}, ${pluralize('notable prerequisite', prerequisites, true)}`
      : '',
    combo.bracketTag ? `Bracket ${BRACKET_RANGE_MAP[combo.bracketTag]} (${BRACKET_NAME_MAP[combo.bracketTag]})` : '',
  ];
  return truncateDescription(
    sentences
      .filter(Boolean)
      .map((sentence) => `${sentence}.`)
      .join(' '),
  );
}

export function comboJsonLd(combo: Variant, description: string) {
  const url = absoluteUrl(comboCanonicalPath(combo));
  return {
    '@type': 'WebPage',
    '@id': url,
    url,
    name: comboName(combo),
    description,
    inLanguage: 'en',
    isPartOf: websiteJsonLd(),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: comboImageUrl(combo),
    },
    about: combo.uses.map(({ card }) => {
      const path = cardPath(card);
      return {
        '@type': 'Thing',
        name: card.name,
        url: path ? absoluteUrl(path) : undefined,
      };
    }),
  };
}
