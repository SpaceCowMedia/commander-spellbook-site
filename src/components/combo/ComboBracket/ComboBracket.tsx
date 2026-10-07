import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import {
  CardInDeckRequest,
  EstimateBracketApi,
  EstimateBracketResult,
  Variant,
} from '@space-cow-media/spellbook-client';
import Icon from 'components/layout/Icon/Icon';
import ComboResults from 'components/search/ComboResults/ComboResults';
import BracketInfo, { BracketSection } from 'components/combo/BracketInfo/BracketInfo';
import { apiConfiguration } from 'services/api.service';
import { cachedTemplateReplacements } from 'lib/templateReplacementsCache';
import { BRACKET_NAME_MAP, BRACKET_RANGE_MAP, getBracketFactors } from 'lib/brackets';
import styles from './comboBracket.module.scss';

interface Props {
  combo: Variant;
}

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

  const otherCombos = estimate?.combos.filter((classified) => classified.combo.id !== combo.id) ?? [];
  const raised = !!estimate && estimate.bracketTag !== combo.bracketTag && estimate.combos.length > 1;

  return (
    <BracketInfo
      subject="combo"
      tag={combo.bracketTag}
      factors={estimate && getBracketFactors(estimate, !raised)}
      failed={failed}
      notice={
        raised && (
          <p id="combo-bracket-raised" className={styles.raised}>
            <Icon name="triangleExclamation" className={styles.raisedIcon} />
            <span>
              The cards of this combo also make {otherCombos.length} other {pluralize('combo', otherCombos.length)},
              raising the estimate to <strong>{BRACKET_NAME_MAP[estimate.bracketTag]}</strong> (Bracket{' '}
              {BRACKET_RANGE_MAP[estimate.bracketTag]}).
            </span>
          </p>
        )
      }
    >
      {raised && (
        <BracketSection id="combo-bracket-other-combos" title="Other combos in these cards">
          <ComboResults results={otherCombos} hideVariants />
        </BracketSection>
      )}
    </BracketInfo>
  );
};

export default ComboBracket;
