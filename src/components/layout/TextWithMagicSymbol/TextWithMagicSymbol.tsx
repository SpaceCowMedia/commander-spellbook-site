import React from 'react';
import styles from './textWithMagicSymbol.module.scss';
import Scryfall from 'scryfall-client';
import CardTooltip from '../CardTooltip/CardTooltip';
import CardLink from '../CardLink/CardLink';
import ScryfallResultsModal from 'components/combo/TemplateCard/ScryfallResultsModal/ScryfallResultsModal';
import { TemplateInVariant } from '@spacecowmedia/spellbook-client';

type Props = {
  text: string;
  cardsInCombo?: string[];
  includeCardLinks?: boolean;
  templatesInCombo?: TemplateInVariant[];
};

const TextWithMagicSymbol: React.FC<Props> = ({ text, cardsInCombo = [], includeCardLinks, templatesInCombo = [] }) => {
  let matchableValuesString = '';

  const cardShortNames = cardsInCombo.reduce((list, name) => {
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

  if (cardsInCombo.length) {
    matchableValuesString = `${cardsInCombo.join('|')}|`;
    if (cardShortNames.length) {
      matchableValuesString += `${cardShortNames.join('|')}|`;
    }
  }

  let filteredText = text;
  if (templatesInCombo.length) {
    templatesInCombo?.forEach((template) => {
      filteredText = filteredText.replace(template.template.name, `template${template.template.id}`);
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
      if (cardsInCombo.includes(value.trim())) {
        return {
          nodeType: 'card',
          cardName: value,
          value,
        };
      } else if (cardShortNames.includes(value.trim())) {
        const fullName = cardsInCombo.find((card) => card.includes(value.trim()));

        if (fullName) {
          return {
            nodeType: 'card',
            cardName: fullName,
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
        } catch (e) {
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
          {item.nodeType === 'card' && (
            <CardTooltip cardName={item.cardName}>
              {includeCardLinks ? (
                <CardLink name={item.cardName || ''}>{item.value}</CardLink>
              ) : (
                <span>{item.value}</span>
              )}
            </CardTooltip>
          )}
          {item.nodeType === 'template' && (
            <ScryfallResultsModal
              scryfallApiUrl={item.template?.template.scryfallApi || ''}
              textTrigger={
                <span className="text-pink-800 cursor-pointer">
                  <TextWithMagicSymbol text={item.template?.template.name || ''} />
                </span>
              }
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
