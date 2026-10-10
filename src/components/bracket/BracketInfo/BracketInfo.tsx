import React, { CSSProperties, useState } from 'react';
import Link from 'next/link';
import { BracketTagEnum, ClassifiedCard } from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from 'components/ui/Icon/Icon';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import PlaceholderText from 'components/ui/PlaceholderText/PlaceholderText';
import CardTooltip from 'components/card/CardTooltip/CardTooltip';
import CardName from 'components/card/CardName/CardName';
import BracketScale from 'components/bracket/BracketScale/BracketScale';
import { addPeriod } from 'lib/text/addPeriod';
import {
  BRACKET_DESCRIPTION_MAP,
  BRACKET_FIT_MAP,
  BRACKET_NAME_MAP,
  BRACKET_RANGE_MAP,
  BracketFactor,
  BracketFactorKind,
} from 'lib/bracket/brackets';
import classNames from 'lib/react/classNames';
import styles from './bracketInfo.module.scss';

const SUBJECTS = {
  combo: {
    label: 'Bracket tag',
    explanation:
      'Bracket tags are estimated from the cards and results of each combo, as a guideline rather than a strict classification.',
    noFactors: 'No factors pushing this combo into a higher bracket were found.',
  },
  deck: {
    label: 'Bracket estimate',
    explanation:
      'The estimate comes from the cards of the list and the combos they make, as a guideline rather than a strict classification.',
    noFactors: 'No factors pushing this card list into a higher bracket were found.',
  },
};

const FACTOR_ICONS: Record<BracketFactorKind, SpellbookIcon> = {
  banned: 'ban',
  gameChanger: 'wandSparkles',
  extraTurn: 'rotateRight',
  massLandDenial: 'explosion',
  control: 'brain',
  lock: 'lock',
  skipTurns: 'forward',
  winning: 'trophy',
  ending: 'flagCheckered',
  powerful: 'bolt',
};

const BRACKET_ARTICLES_URL = 'https://magic.wizards.com/en/news/announcements?search=%22commander+brackets%22';

interface Props {
  subject: keyof typeof SUBJECTS;
  tag?: BracketTagEnum;
  factors?: BracketFactor[];
  failed?: boolean;
  notice?: React.ReactNode;
  children?: React.ReactNode;
}

const CardChips: React.FC<{ cards: ClassifiedCard[] }> = ({ cards }) => (
  <ul className={styles.cards}>
    {cards.map(({ card, quantity }) => (
      <li key={card.id}>
        <CardTooltip card={card}>
          <span className={styles.card}>
            {quantity > 1 && `${quantity}× `}
            <CardName name={card.name} />
          </span>
        </CardTooltip>
      </li>
    ))}
  </ul>
);

/* The placeholders fade out over the content fading in. Not a view transition: the content arrives on its own time,
   and an input landing while a view transition starts can be lost. */
const Pending: React.FC<{ settled: boolean; placeholders: React.ReactNode; children: React.ReactNode }> = ({
  settled,
  placeholders,
  children,
}) => (
  <div className={styles.pending}>
    <div className={classNames(styles.placeholders, settled && styles.settled)} aria-hidden>
      {placeholders}
    </div>
    {children}
  </div>
);

export const BracketSection: React.FC<{ id?: string; title: React.ReactNode; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <div id={id} className={styles.section}>
    <h3 className={styles.label}>{title}</h3>
    {children}
  </div>
);

const BracketInfo: React.FC<Props> = ({ subject, tag, factors, failed = false, notice, children }) => {
  const [tagPending] = useState(!tag);
  const { label, explanation, noFactors } = SUBJECTS[subject];
  const id = `${subject}-bracket`;
  const fit = tag && BRACKET_FIT_MAP[tag];

  const tagValue = tag && (
    <div>
      <div className={styles.tagValue}>
        <span id={`${id}-name`} className={classNames(styles.tagName, !fit && styles.notLegal)}>
          {BRACKET_NAME_MAP[tag]}
        </span>
        <span className={styles.tagRange}>Bracket {BRACKET_RANGE_MAP[tag]}</span>
      </div>
      <p className={styles.tagDescription}>{BRACKET_DESCRIPTION_MAP[tag]}</p>
    </div>
  );

  return (
    <section id={id} className={styles.panel} aria-labelledby={`${id}-heading`}>
      <div
        className={styles.tag}
        style={fit ? ({ '--level': (fit.lowest + fit.sure) / 2 } as CSSProperties) : undefined}
      >
        <div id={`${id}-heading`} className={styles.label}>
          <Icon name="bracket" /> {label}
        </div>
        {tagPending ? (
          <Pending
            settled={!!tag || failed}
            placeholders={
              <>
                <div className={styles.namePlaceholder}>
                  <PlaceholderText maxLength={40} />
                </div>
                <PlaceholderText />
              </>
            }
          >
            {tagValue}
          </Pending>
        ) : (
          tagValue
        )}
        <BracketScale id={`${id}-scale`} tag={tag} className="mt-5" />
        <p className={styles.explanation}>{explanation}</p>
        <div className={styles.links}>
          <Link href="/syntax-guide/#bracket-tags">What the tags mean →</Link>
          <ExternalLink href={BRACKET_ARTICLES_URL}>Commander brackets ↗</ExternalLink>
        </div>
      </div>

      <div className={styles.factors}>
        <h3 className={styles.label}>What raises the bracket</h3>
        <Pending
          settled={!!factors || failed}
          placeholders={
            <>
              <PlaceholderText />
              <PlaceholderText />
              <PlaceholderText maxLength={60} />
            </>
          }
        >
          {notice}
          {factors && (
            <ul id={`${id}-factors`} className={styles.factorList}>
              {factors.map((factor, index) => (
                <li key={index} className={styles.factor}>
                  <span className={styles.factorIcon}>
                    <Icon name={FACTOR_ICONS[factor.kind]} />
                  </span>
                  <div>
                    {addPeriod(factor.text)}
                    {factor.cards && factor.cards.length > 0 && <CardChips cards={factor.cards} />}
                  </div>
                </li>
              ))}
              {factors.length === 0 && (
                <li className={styles.factor}>
                  <span className={styles.factorIcon}>
                    <Icon name="seedling" />
                  </span>
                  <div>{noFactors}</div>
                </li>
              )}
            </ul>
          )}
          {failed && <p className={styles.note}>The estimate could not be loaded. Reload the page to try again.</p>}
        </Pending>
      </div>

      {children}
    </section>
  );
};

export default BracketInfo;
