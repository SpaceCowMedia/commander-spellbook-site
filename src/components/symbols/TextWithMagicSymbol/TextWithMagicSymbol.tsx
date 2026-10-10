import React from 'react';
import styles from './textWithMagicSymbol.module.scss';
import CardTooltip from 'components/card/CardTooltip/CardTooltip';
import GenericMana from 'components/symbols/GenericMana/GenericMana';
import MagicSymbol from 'components/symbols/MagicSymbol/MagicSymbol';
import CardLink from 'components/card/CardLink/CardLink';
import CardName from 'components/card/CardName/CardName';
import TemplateReplacementsModal from 'components/card/TemplateCard/TemplateReplacementsModal/TemplateReplacementsModal';
import TemplateTooltip from 'components/card/TemplateTooltip/TemplateTooltip';
import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';
import {
  getFaceMentionedBy,
  getFaceNames,
  getFaceTypes,
  getName,
  getShortNames,
  getTemplateNameSummary,
} from 'lib/card/faces';
import { findCardSymbol } from 'lib/symbols/symbology';
import TextWithSuperscripts, { hasSuperscripts } from 'components/ui/TextWithSuperscripts/TextWithSuperscripts';

interface Props {
  text: string;
  cardsInCombo?: CardInVariant[];
  includeCardLinks?: boolean;
  templatesInCombo?: TemplateInVariant[];
}

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/* Punctuation right after a mana symbol must not be pushed to the next line on its own:
   an <img> is a line break opportunity, so the punctuation is moved inside the symbol's
   non-wrapping container instead of starting the following text node. */
const PUNCTUATION_AFTER_SYMBOL = /^[.,;:!?)\]}'"’”»…]+/;

/* an amount of generic mana, written 1234 or 1,234 */
const GENERIC_AMOUNT = /^(\d+|\d{1,3}(,\d{3})+)$/;

function isWholeWordMatch(text: string, start: number, length: number): boolean {
  const before = text[start - 1];
  const after = text[start + length];
  return !(before && WORD_CHARACTER.test(before)) && !(after && WORD_CHARACTER.test(after));
}

function replaceAlli(text: string, searchValue: string, replaceValue: string, wholeWord = false): string {
  const positions = [];
  let shift = 0;
  const delta = replaceValue.length - searchValue.length;
  const lowerText = text.toLowerCase();
  const lowerSearchValue = searchValue.toLowerCase();
  let pos = lowerText.indexOf(lowerSearchValue);
  while (pos !== -1) {
    if (!wholeWord || isWholeWordMatch(lowerText, pos, lowerSearchValue.length)) {
      positions.push(pos);
    }
    pos = lowerText.indexOf(lowerSearchValue, pos + searchValue.length);
  }
  positions.forEach((i) => {
    i += shift;
    text = text.substring(0, i) + replaceValue + text.substring(i + searchValue.length);
    shift += delta;
  });
  return text;
}

const TextWithMagicSymbol: React.FC<Props> = ({ text, cardsInCombo = [], includeCardLinks, templatesInCombo = [] }) => {
  let matchableValuesString = '';

  const cardNames = cardsInCombo.map(getName);
  const cardShortNames = cardsInCombo
    .reduce((list, { card }) => {
      const faceNames = getFaceNames(card.name);
      if (card.faces > 1) {
        list.push(...faceNames);
      }
      faceNames.forEach((faceName, index) => list.push(...getShortNames(faceName, getFaceTypes(card, index + 1))));

      return list;
    }, [] as string[])
    .filter((name, i, list) => name && list.indexOf(name) === i)
    .sort((a, b) => b.length - a.length);

  if (cardNames.length) {
    matchableValuesString = `${cardNames.join('|')}|`;
    if (cardShortNames.length) {
      matchableValuesString += `${cardShortNames.join('|')}|`;
    }
  }

  const templateMentions = [
    ...templatesInCombo.map((template) => ({ template, name: getName(template), wholeWord: false })),
    ...templatesInCombo.flatMap((template) => {
      const summary = getTemplateNameSummary(getName(template));
      return summary ? [{ template, name: summary, wholeWord: true }] : [];
    }),
  ];
  const tokenWidth = String(templateMentions.length).length;
  const templateTokens = templateMentions.map((_, i) => `template${String(i).padStart(tokenWidth, '0')}`);

  let filteredText = text;
  if (templateMentions.length) {
    templateMentions.forEach((mention, i) => {
      filteredText = replaceAlli(filteredText, mention.name, templateTokens[i], mention.wholeWord);
    });
    matchableValuesString += templateTokens.join('|') + '|';
  }

  matchableValuesString = `(${matchableValuesString}:mana[^:]+:|{[^}]+})`;

  const matchableValuesRegex = new RegExp(matchableValuesString, 'g');

  const parsedItems = filteredText
    .split(matchableValuesRegex)
    .filter((val) => val)
    .map((value) => {
      if (cardNames.includes(value.trim())) {
        return {
          nodeType: 'card',
          card: cardsInCombo.find((card) => getName(card) === value.trim()),
          value,
        };
      } else if (cardShortNames.includes(value.trim())) {
        const card = cardsInCombo.find((card) => getName(card).includes(value.trim()));

        if (card) {
          return {
            nodeType: 'card',
            card: card,
            value,
          };
        }
      }
      const templateIndex = templateTokens.indexOf(value.trim());
      if (templateIndex !== -1) {
        return {
          nodeType: 'template',
          template: templateMentions[templateIndex].template,
          value: templateMentions[templateIndex].name,
        };
      }
      const symbolMatch = value.match(/:mana([^:]+):|{([^}]+)}/);
      const code = symbolMatch && (symbolMatch[1] || symbolMatch[2]);
      const symbol = code && findCardSymbol(code);
      if (symbol) {
        return {
          nodeType: 'image',
          value,
          symbol,
        };
      }
      if (code && GENERIC_AMOUNT.test(code)) {
        return {
          nodeType: 'image',
          value,
          genericAmount: Number(code.replaceAll(',', '')),
        };
      }

      return {
        nodeType: 'text',
        value,
      };
    });

  const symbolTrailingText = new Map<(typeof parsedItems)[number], string>();
  parsedItems.forEach((item, i) => {
    const next = parsedItems[i + 1];
    if (item.nodeType !== 'image' || !next || next.nodeType !== 'text') {
      return;
    }
    const punctuation = next.value.match(PUNCTUATION_AFTER_SYMBOL);
    if (punctuation) {
      symbolTrailingText.set(item, punctuation[0]);
      next.value = next.value.slice(punctuation[0].length);
    }
  });

  const items = parsedItems.filter((item) => item.nodeType !== 'text' || item.value);

  return (
    <span>
      {items.map((item, i) => (
        <span key={i} className={styles[`${item.nodeType}Container`]}>
          {item.nodeType === 'image' && (
            <span className={styles.noWrap}>
              {item.symbol ? (
                <MagicSymbol symbol={item.symbol} className={styles.magicSymbol} />
              ) : (
                <GenericMana amount={item.genericAmount ?? 0} className={styles.magicSymbol} />
              )}
              {symbolTrailingText.get(item)}
            </span>
          )}
          {item.nodeType === 'card' && item.card && (
            <CardTooltip
              card={item.card.card}
              faceToShow={getFaceMentionedBy(item.card, item.value)}
              suppressClick={includeCardLinks}
            >
              {includeCardLinks ? (
                <CardLink name={item.card.card.name} className="no-underline!">
                  <CardName name={item.value} />
                </CardLink>
              ) : (
                <CardName name={item.value} />
              )}
            </CardTooltip>
          )}
          {item.nodeType === 'template' && item.template && (
            <TemplateReplacementsModal
              template={item.template}
              textTrigger={(_) => (
                <TemplateTooltip template={item.template!}>
                  <span className={`cursor-pointer ${includeCardLinks ? 'text-link dark:text-primary' : ''}`}>
                    <TextWithMagicSymbol text={item.value} />
                  </span>
                </TemplateTooltip>
              )}
            />
          )}
          {item.nodeType !== 'card' &&
            item.nodeType !== 'image' &&
            item.nodeType !== 'template' &&
            (hasSuperscripts(item.value) ? <TextWithSuperscripts text={item.value} /> : <CardName name={item.value} />)}
        </span>
      ))}
    </span>
  );
};

export default TextWithMagicSymbol;
