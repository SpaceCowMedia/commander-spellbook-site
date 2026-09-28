import React, { CSSProperties } from 'react';
import styles from './saltMeter.module.scss';
import { MAX_SALT, SALT_LEVELS } from 'lib/salt';
import cn from 'lib/cn';

interface Props {
  salt: number | null;
  className?: string;
}

const SEGMENTS = Array.from({ length: MAX_SALT }, (_, segment) => segment);

const SaltMeter: React.FC<Props> = ({ salt, className }) => {
  return (
    <div className={cn(styles.meter, salt === null && styles.empty, className)} aria-hidden="true">
      <div className={styles.segments}>
        {SEGMENTS.map((segment) => (
          <div
            key={segment}
            className={styles.segment}
            style={
              {
                '--segment': segment,
                '--amount': Math.min(Math.max((salt ?? 0) - segment, 0), 1),
              } as CSSProperties
            }
          >
            <div className={styles.fill} />
          </div>
        ))}
      </div>
      <div className={styles.captions}>
        <span>0 · {SALT_LEVELS[0]}</span>
        <span>
          {MAX_SALT} · {SALT_LEVELS[MAX_SALT]}
        </span>
      </div>
    </div>
  );
};

export default SaltMeter;
