import React from 'react';
import { CardDetail } from '@space-cow-media/spellbook-client';
import CardImage from 'components/layout/CardImage/CardImage';
import CardName from 'components/layout/CardName/CardName';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { FACE_SEPARATOR, getFaceNames } from 'lib/types';
import sections from '../cardSections.module.scss';
import styles from './cardDetails.module.scss';

interface Props {
  card: CardDetail;
  summary: string;
}

interface Face {
  name: string;
  typeLine: string;
  manaCost: string;
  oracleText: string;
}

const FACE_TEXT_SEPARATOR = '\n\n';

function getFaces(card: CardDetail): Face[] {
  const names = getFaceNames(card.name);
  const typeLines = card.typeLine.split(FACE_SEPARATOR);
  const texts = card.oracleText.split(FACE_TEXT_SEPARATOR);
  if (card.faces > 1 && names.length === card.faces && texts.length === card.faces) {
    return names.map((name, index) => ({
      name,
      typeLine: typeLines.length === card.faces ? typeLines[index] : index === 0 ? card.typeLine : '',
      manaCost: index === 0 ? card.manaCost : '',
      oracleText: texts[index],
    }));
  }
  return [{ name: card.name, typeLine: card.typeLine, manaCost: card.manaCost, oracleText: card.oracleText }];
}

function toManaSymbols(colors: string): string {
  return colors
    .split('')
    .map((color) => `{${color}}`)
    .join('');
}

function getBadges(card: CardDetail) {
  return [
    { show: card.spoiler, label: 'Preview', title: 'Not released yet', className: sections.badgeHighlight },
    {
      show: !card.legalities.commander && !card.spoiler,
      label: 'Banned in Commander',
      title: 'Not legal in Commander',
      className: sections.badgeDanger,
    },
    { show: card.gameChanger, label: 'Game Changer', title: 'On the Commander Game Changers list' },
    { show: card.tutor, label: 'Tutor', title: 'Searches the library for cards' },
    { show: card.massLandDenial, label: 'Mass Land Denial', title: 'Destroys or denies many lands' },
    { show: card.extraTurn, label: 'Extra Turn', title: 'Grants extra turns' },
    { show: card.reserved, label: 'Reserved List', title: 'On the Reserved List, never to be reprinted' },
  ].filter((badge) => badge.show);
}

const CardDetails: React.FC<Props> = ({ card, summary }) => {
  const faces = getFaces(card);
  const badges = getBadges(card);
  const keywords: string[] = Array.isArray(card.keywords) ? card.keywords : [];
  const powerToughness = card.power || card.toughness ? `${card.power}/${card.toughness}` : '';
  const producedMana = toManaSymbols(card.producedMana);

  return (
    <section id="card-details" className={`${sections.section} ${styles.details}`}>
      <div className={styles.image}>
        <CardImage card={card} noLink />
      </div>
      <div className={styles.text}>
        <p className="mb-4">{summary}</p>
        <div id="card-oracle">
          {faces.map((face) => (
            <div key={face.name} className={styles.face}>
              <div className={styles.faceHeader}>
                <CardName name={face.name} />
                {face.manaCost && <TextWithMagicSymbol text={face.manaCost} />}
              </div>
              {face.typeLine && <div className={styles.typeLine}>{face.typeLine}</div>}
              <div className={styles.oracle}>
                {face.oracleText
                  .split('\n')
                  .filter((line) => line.trim())
                  .map((line, index) => (
                    <p key={index}>
                      <TextWithMagicSymbol text={line} />
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <dl className={styles.facts}>
          <dt>Mana value</dt>
          <dd>{card.manaValue}</dd>
          {powerToughness && (
            <>
              <dt>Power/Toughness</dt>
              <dd>{powerToughness}</dd>
            </>
          )}
          {card.loyalty && (
            <>
              <dt>Loyalty</dt>
              <dd>{card.loyalty}</dd>
            </>
          )}
          {keywords.length > 0 && (
            <>
              <dt>Keywords</dt>
              <dd>{keywords.join(', ')}</dd>
            </>
          )}
          {producedMana && (
            <>
              <dt>Produces</dt>
              <dd>
                <TextWithMagicSymbol text={producedMana} />
              </dd>
            </>
          )}
          <dt>Color identity</dt>
          <dd>
            <TextWithMagicSymbol text={toManaSymbols(card.identity)} />
          </dd>
        </dl>
        {badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((badge) => (
              <span key={badge.label} className={`${sections.badge} ${badge.className ?? ''}`} title={badge.title}>
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CardDetails;
