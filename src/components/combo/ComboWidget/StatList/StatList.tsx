import React from 'react';
import StatValue from 'components/combo/ComboWidget/StatValue/StatValue';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import type { Stat } from 'lib/combo/widgets/shared/calculator';
import styles from './statList.module.scss';

interface Props {
  stats: Stat[];
}

const StatList: React.FC<Props> = ({ stats }) => (
  <dl className={styles.stats}>
    {stats.map((stat) => (
      <div key={stat.label} className={styles.stat}>
        <dt className={styles.label}>{stat.label}</dt>
        <dd className={styles.value}>
          <StatValue stat={stat} />
        </dd>
        {stat.caption && (
          <dd className={styles.caption}>
            <TextWithMagicSymbol text={stat.caption} />
          </dd>
        )}
      </div>
    ))}
  </dl>
);

export default StatList;
