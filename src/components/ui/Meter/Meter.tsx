import React from 'react';
import TextWithSuperscripts from 'components/ui/TextWithSuperscripts/TextWithSuperscripts';
import { TONES } from 'components/ui/tones/tones';
import classNames from 'lib/react/classNames';
import styles from './meter.module.scss';

interface Props {
  label: string;
  have: number;
  need: number;
  unit: string;
  format?: (value: number) => string;
}

/* How far what you have goes toward what you need. */
const Meter: React.FC<Props> = ({ label, have, need, unit, format = (value) => value.toLocaleString('en-US') }) => {
  const enough = have >= need;
  const ratio = need > 0 ? Math.min(1, Math.max(0, have / need)) : 1;
  return (
    <div className={classNames(styles.meter, TONES[enough ? 'good' : 'bad'].className)}>
      <div
        role="meter"
        className={styles.track}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, need)}
        aria-valuenow={Math.min(Math.max(0, have), Math.max(0, need))}
        aria-valuetext={`${format(have)} of ${format(need)} ${unit}`}
      >
        <div className={styles.fill} style={{ '--ratio': ratio } as React.CSSProperties} />
      </div>
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.have}>
          <TextWithSuperscripts text={format(have)} />
        </span>{' '}
        of <TextWithSuperscripts text={format(need)} /> {unit}
      </p>
    </div>
  );
};

export default Meter;
