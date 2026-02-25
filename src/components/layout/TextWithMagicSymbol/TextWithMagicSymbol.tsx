import React from 'react';
import styles from './textWithMagicSymbol.module.scss';
import Scryfall from 'scryfall-client';
import CardTooltip from '../CardTooltip/CardTooltip';
import CardLink from '../CardLink/CardLink';
import TemplateReplacementsModal from '../../combo/TemplateCard/TemplateReplacementsModal/TemplateReplacementsModal';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';

interface Props {
  text: string;
  cardsInCombo?: CardInVariant[];
  includeCardLinks?: boolean;
  templatesInCombo?: TemplateInVariant[];
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
}

function replaceAlli(text: string, searchValue: string, replaceValue: string): string {
  const positions = [];
  let shift = 0;
  const delta = replaceValue.length - searchValue.length;
  const lowerText = text.toLowerCase();
  const lowerSearchValue = searchValue.toLowerCase();
  let pos = lowerText.indexOf(lowerSearchValue);
  while (pos !== -1) {
    positions.push(pos);
    pos = lowerText.indexOf(lowerSearchValue, pos + searchValue.length);
  }
  positions.forEach((i) => {
    i += shift;
    text = text.substring(0, i) + replaceValue + text.substring(i + searchValue.length);
    shift += delta;
  });
  return text;
}

const TextWithMagicSymbol: React.FC<Props> = ({
  text,
  cardsInCombo = [],
  includeCardLinks,
  templatesInCombo = [],
  fetchTemplateReplacements,
}) => {
  let matchableValuesString = '';

  const cardNames = cardsInCombo.map((card) => card.card.name);
  const cardShortNames = cardNames.reduce((list, name) => {
    if (name.match(/^[^,]+,/)) {
      list.push(name.split(',')[0]);
    } else if (name.match(/^[^\s]+\s(the|of)\s/i)) {
      list.push(name.split(/\s(the|of)/i)[0]);
    } else if (name.includes(' // ')) {
      list.push(...name.split(' // '));
    } else if (name.match(/^the\s/i)) {
      const restOfName = name.split(/^the\s/i)[1];

      list.push(restOfName);
      list.push(restOfName.split(' ')[0]);
    }

    return list;
  }, [] as string[]);

  if (cardNames.length) {
    matchableValuesString = `${cardNames.join('|')}|`;
    if (cardShortNames.length) {
      matchableValuesString += `${cardShortNames.join('|')}|`;
    }
  }

  let filteredText = text;
  if (templatesInCombo.length) {
    templatesInCombo.forEach((template) => {
      filteredText = replaceAlli(filteredText, template.template.name, `template${template.template.id}`);
    });
    matchableValuesString += templatesInCombo.map((template) => `template${template.template.id}`).join('|') + '|';
  }
  const templateNames = templatesInCombo?.map((template) => `template${template.template.id}`) || [];

  matchableValuesString = `(${matchableValuesString}:mana[^:]+:|{[^}]+})`;

  const matchableValuesRegex = new RegExp(matchableValuesString, 'g');

  const items = filteredText
    .split(matchableValuesRegex)
    .filter((val) => val)
    .map((value) => {
      if (cardNames.includes(value.trim())) {
        return {
          nodeType: 'card',
          card: cardsInCombo.find((card) => card.card.name === value.trim()),
          value,
        };
      } else if (cardShortNames.includes(value.trim())) {
        const card = cardsInCombo.find((card) => card.card.name.includes(value.trim()));

        if (card) {
          return {
            nodeType: 'card',
            card: card,
            value,
          };
        }
      }
      if (templateNames.includes(value.trim())) {
        return {
          nodeType: 'template',
          template: templatesInCombo.find(
            (template) => template.template.id === Number(value.trim().replace('template', '')),
          ),
          value,
        };
      }
      const manaMatch = value.match(/:mana([^:]+):|{([^}]+)}/);

      if (manaMatch) {
        let manaSymbol = (manaMatch[1] || manaMatch[2]).replace('/', '');
        if (manaSymbol[0] === 'p') {
          manaSymbol = manaSymbol[1] + manaSymbol[0];
        } // This is a hack to swap the p and other symbol for phyrexian mana
        try {
          return {
            nodeType: 'image',
            value: Scryfall.getSymbolUrl(manaSymbol),
            manaSymbol,
          };
        } catch {
          console.log('Error getting mana symbol', manaSymbol);
          return {
            nodeType: 'text',
            value,
          };
        }
      }

      return {
        nodeType: 'text',
        value,
      };
    });

  return (
    <span>
      {items.map((item, i) => (
        <span key={i} className={styles[`${item.nodeType}Container`]}>
          {item.nodeType === 'image' && (
            <span>
              <span className="sr-only">({`{${item.manaSymbol}}`} magic symbol) &nbsp;</span>
              <img
                aria-hidden="true"
                className={styles.magicSymbol}
                src={item.value}
                alt={`Magic Symbol (${item.manaSymbol})`}
              />
            </span>
          )}
          {item.nodeType === 'card' && item.card && (
            <CardTooltip card={item.card.card}>
              {includeCardLinks ? (
                <CardLink name={item.card.card.name}>{item.value}</CardLink>
              ) : (
                <span>{item.value}</span>
              )}
            </CardTooltip>
          )}
          {item.nodeType === 'template' && item.template && (
            <TemplateReplacementsModal
              template={item.template}
              textTrigger={(_) => (
                <span className={`cursor-pointer ${includeCardLinks ? 'text-link dark:text-primary' : ''}`}>
                  <TextWithMagicSymbol text={item.template!.template.name} />
                </span>
              )}
              fetchTemplateReplacements={fetchTemplateReplacements}
            />
          )}
          {item.nodeType !== 'card' && item.nodeType !== 'image' && item.nodeType !== 'template' && (
            <span>{item.value}</span>
          )}
        </span>
      ))}
    </span>
  );
};

export default TextWithMagicSymbol;
