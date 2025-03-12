import React from 'react';
import styles from './textWithMagicSymbol.module.scss';
import Scryfall from 'scryfall-client';
import CardTooltip from '../CardTooltip/CardTooltip';
import CardLink from '../CardLink/CardLink';
import TemplateReplacementsModal from '../../combo/TemplateCard/TemplateReplacementsModal/TemplateReplacementsModal';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';

type Props = {
  text: string;
  cardsInCombo?: CardInVariant[];
  includeCardLinks?: boolean;
  templatesInCombo?: TemplateInVariant[];
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
};

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
      filteredText = filteredText.replace(template.template.name, `template${template.template.id}`);
      filteredText = filteredText.replace(template.template.name.toLowerCase(), `template${template.template.id}`);
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
          cardName: value,
          value,
        };
      } else if (cardShortNames.includes(value.trim())) {
        const fullName = cardNames.find((card) => card.includes(value.trim()));

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
        } catch (_e) {
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
