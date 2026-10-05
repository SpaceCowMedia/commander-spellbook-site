import React, { CSSProperties, useEffect, useState } from 'react';
import Link from 'next/link';
import pluralize from 'pluralize';
import {
  CardInDeckRequest,
  ClassifiedCard,
  EstimateBracketApi,
  EstimateBracketResult,
  Variant,
} from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from 'components/layout/Icon/Icon';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import PlaceholderText from 'components/layout/PlaceholderText/PlaceholderText';
import CardTooltip from 'components/layout/CardTooltip/CardTooltip';
import CardName from 'components/layout/CardName/CardName';
import ComboResults from 'components/search/ComboResults/ComboResults';
import BracketScale from 'components/combo/BracketScale/BracketScale';
import { apiConfiguration } from 'services/api.service';
import { cachedTemplateReplacements } from 'lib/templateReplacementsCache';
import { addPeriod } from 'lib/addPeriod';
import {
  BRACKET_DESCRIPTION_MAP,
  BRACKET_FIT_MAP,
  BRACKET_NAME_MAP,
  BRACKET_RANGE_MAP,
  BracketFactorKind,
  getBracketFactors,
} from 'lib/brackets';
import cn from 'lib/cn';
import styles from './comboBracket.module.scss';

interface Props {
  combo: Variant;
}

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

async function estimateBracket(combo: Variant): Promise<EstimateBracketResult> {
  const templates: CardInDeckRequest[] = [];
  for (const template of combo.requires) {
    const page = await cachedTemplateReplacements(template.template, 0);
    if (page.results.length) {
      templates.push({ card: page.results[0].name, quantity: template.quantity });
    }
  }
  return new EstimateBracketApi(apiConfiguration()).estimateBracketCreate({
    unknownCommanders: true,
    deckRequest: {
      main: templates.concat(combo.uses.map((use) => ({ card: use.card.name, quantity: use.quantity }))),
    },
  });
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

const ComboBracket: React.FC<Props> = ({ combo }) => {
  const [estimate, setEstimate] = useState<EstimateBracketResult>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    estimateBracket(combo)
      .then(setEstimate)
      .catch((error) => {
        console.error('Error fetching bracket estimate', error);
        setFailed(true);
      });
  }, [combo]);

  const tag = combo.bracketTag;
  const fit = BRACKET_FIT_MAP[tag];
  const otherCombos = estimate?.combos.filter((classified) => classified.combo.id !== combo.id) ?? [];
  const raised = !!estimate && estimate.bracketTag !== tag && estimate.combos.length > 1;
  const factors = estimate ? getBracketFactors(estimate, !raised) : [];

  return (
    <section id="combo-bracket" className={styles.panel} aria-labelledby="combo-bracket-heading">
      <div
        className={styles.tag}
        style={fit ? ({ '--level': (fit.lowest + fit.sure) / 2 } as CSSProperties) : undefined}
      >
        <div id="combo-bracket-heading" className={styles.label}>
          <Icon name="bracket" /> Bracket tag
        </div>
        <div className={styles.tagValue}>
          <span id="combo-bracket-name" className={cn(styles.tagName, !fit && styles.notLegal)}>
            {BRACKET_NAME_MAP[tag]}
          </span>
          <span className={styles.tagRange}>Bracket {BRACKET_RANGE_MAP[tag]}</span>
        </div>
        <p className={styles.tagDescription}>{BRACKET_DESCRIPTION_MAP[tag]}</p>
        <BracketScale id="combo-bracket-scale" tag={tag} className="mt-5" />
        <p className={styles.explanation}>
          Bracket tags are estimated from the cards and results of each combo, as a guideline rather than a strict
          classification.
        </p>
        <div className={styles.links}>
          <Link href="/syntax-guide/#bracket-tags">What the tags mean →</Link>
          <ExternalLink href={BRACKET_ARTICLES_URL}>Commander brackets ↗</ExternalLink>
        </div>
      </div>

      <div className={styles.factors}>
        <h3 className={styles.label}>What raises the bracket</h3>
        {raised && (
          <p id="combo-bracket-raised" className={styles.raised}>
            <Icon name="triangleExclamation" className={styles.raisedIcon} />
            <span>
              The cards of this combo also make {otherCombos.length} other {pluralize('combo', otherCombos.length)},
              raising the estimate to <strong>{BRACKET_NAME_MAP[estimate.bracketTag]}</strong> (Bracket{' '}
              {BRACKET_RANGE_MAP[estimate.bracketTag]}).
            </span>
          </p>
        )}
        {estimate && (
          <ul id="combo-bracket-factors" className={styles.factorList}>
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
                <div>No factors pushing this combo into a higher bracket were found.</div>
              </li>
            )}
          </ul>
        )}
        {!estimate && !failed && (
          <div className={styles.placeholders}>
            <PlaceholderText />
            <PlaceholderText />
            <PlaceholderText maxLength={60} />
          </div>
        )}
        {failed && <p className={styles.note}>The estimate could not be loaded. Reload the page to try again.</p>}
      </div>

      {raised && (
        <div id="combo-bracket-other-combos" className={styles.otherCombos}>
          <h3 className={styles.label}>Other combos in these cards</h3>
          <ComboResults results={otherCombos} hideVariants />
        </div>
      )}
    </section>
  );
};

export default ComboBracket;
