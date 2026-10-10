import React from 'react';
import Icon from 'components/ui/Icon/Icon';
import { TONES } from 'components/ui/tones/tones';
import classNames from 'lib/react/classNames';
import type { Tone } from 'lib/tone';
import styles from './toneBadge.module.scss';

interface Props {
  tone: Tone;
  text: string;
}

const ToneBadge: React.FC<Props> = ({ tone, text }) => (
  <span className={classNames(styles.badge, TONES[tone].className)}>
    <span aria-hidden="true">
      <Icon name={TONES[tone].icon} />
    </span>
    {text}
  </span>
);

export default ToneBadge;
