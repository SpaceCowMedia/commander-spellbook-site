import React from 'react';
import StatValue from 'components/combo/ComboWidget/StatValue/StatValue';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import Icon from 'components/ui/Icon/Icon';
import Meter from 'components/ui/Meter/Meter';
import { TONES } from 'components/ui/tones/tones';
import type { Result } from 'lib/combo/widgets/shared/calculator';
import { capitalize, formatNumber } from 'lib/combo/widgets/shared/format';
import classNames from 'lib/react/classNames';
import styles from './resultSummary.module.scss';

interface Props {
  result: Result;
}

/* The answer, read out again whenever it changes, and how it compares with what you have. */
const ResultSummary: React.FC<Props> = ({ result: { headline, verdict, meter } }) => (
  <div className={styles.summary}>
    <div className={styles.answer} role="status">
      <p className={styles.headline}>
        <span className={styles.label}>{headline.label}</span>
        <span
          key={headline.value}
          className={classNames(styles.value, headline.mana && styles.mana)}
          style={{ '--characters': Math.max(3, headline.value.length) } as React.CSSProperties}
        >
          <StatValue stat={headline} />
        </span>
        {headline.caption && (
          <span className={styles.caption}>
            <TextWithMagicSymbol text={headline.caption} />
          </span>
        )}
      </p>
      {verdict && (
        <div className={classNames(styles.verdict, TONES[verdict.tone].className)}>
          <span className={styles.verdictIcon} aria-hidden="true">
            <Icon name={TONES[verdict.tone].icon} />
          </span>
          <p>
            <span className={styles.verdictTitle}>{verdict.title}</span>
            {verdict.detail && (
              <span className={styles.verdictDetail}>
                {' '}
                <TextWithMagicSymbol text={verdict.detail} />
              </span>
            )}
          </p>
        </div>
      )}
    </div>
    {meter && meter.need > 0 && (
      <Meter
        label={capitalize(meter.unit)}
        have={meter.have}
        need={meter.need}
        unit={meter.unit}
        format={formatNumber}
      />
    )}
  </div>
);

export default ResultSummary;
