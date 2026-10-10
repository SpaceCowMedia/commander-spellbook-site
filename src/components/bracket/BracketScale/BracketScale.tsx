import React, { CSSProperties } from 'react';
import { BracketTagEnum } from '@space-cow-media/spellbook-client';
import { bracketFit, COMMANDER_BRACKETS } from 'lib/bracket/brackets';
import classNames from 'lib/react/classNames';
import styles from './bracketScale.module.scss';

interface Props {
  tag?: BracketTagEnum;
  id?: string;
  className?: string;
}

const FIT_LABELS = {
  fits: 'fits',
  borderline: 'borderline',
  excluded: 'too strong',
};

const BracketScale: React.FC<Props> = ({ tag, id, className }) => {
  return (
    <div id={id} className={classNames(styles.scale, className)} aria-hidden="true">
      <div className={styles.bars}>
        {COMMANDER_BRACKETS.map((name, index) => {
          const bracket = index + 1;
          const fit = tag && bracketFit(tag, bracket);
          return (
            <div
              key={bracket}
              className={classNames(styles.bar, fit && styles[fit])}
              style={{ '--step': index } as CSSProperties}
              title={`Bracket ${bracket} · ${name}${fit ? `: ${FIT_LABELS[fit]}` : ''}`}
              data-bracket={bracket}
              data-fit={fit}
            >
              {fit && fit !== 'excluded' && <div className={styles.fill} />}
              <span className={styles.number}>{bracket}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.captions}>
        <span>1 · {COMMANDER_BRACKETS[0]}</span>
        <span>
          {COMMANDER_BRACKETS.length} · {COMMANDER_BRACKETS[COMMANDER_BRACKETS.length - 1]}
        </span>
      </div>
    </div>
  );
};

export default BracketScale;
