import React from 'react';
import classNames from 'lib/react/classNames';
import styles from './genericMana.module.scss';

interface Props {
  amount: number;
  className?: string;
}

/* STIX Two Text's figures, in ems */
const FIGURE_HEIGHT = 0.642;
const FIGURE_ADVANCE = 0.495;
const COMMA_ADVANCE = 0.245;
/* how far its round figures dip below the line the flat ones stand on */
const OVERSHOOT = 0.012;
/* how far up a comma goes, as Scryfall's do, to keep its tail inside the pill */
const COMMA_LIFT = 0.11;

const HEIGHT = 100;
/* how tall Scryfall's own figures are and the line they stand on: {10} to {19}'s in the middle of the
   circle, {100}'s, and {1000000}'s on the same line but taller */
const CIRCLE = { figureHeight: 58, baseline: 79, tracking: -0.06, padding: 0 };
const PILL = { figureHeight: 74, baseline: 87, tracking: 0.01, padding: 18 };
const LONG_PILL = { ...PILL, figureHeight: 78 };

/* The generic mana symbol of an amount Scryfall has none for, drawn like its own: two figures in a
   circle like {20}, three in a pill like {100}, more with commas like {1000000}. */
const GenericMana: React.FC<Props> = ({ amount, className }) => {
  const text = amount.toLocaleString('en-US');
  const shape = text.length > 3 ? LONG_PILL : text.length > 2 ? PILL : CIRCLE;
  const fontSize = shape.figureHeight / FIGURE_HEIGHT;
  const tracking = shape.tracking * fontSize;
  const advances = [...text].map(
    (character) => (character === ',' ? COMMA_ADVANCE : FIGURE_ADVANCE) * fontSize + tracking,
  );
  const textWidth = advances.reduce((total, advance) => total + advance, -tracking);
  const width = shape === CIRCLE ? HEIGHT : textWidth + 2 * shape.padding;
  const origins = advances.map((_, index) =>
    advances.slice(0, index).reduce((x, advance) => x + advance, (width - textWidth) / 2),
  );
  /* flat figures end just above Scryfall's line and round ones just below */
  const line = shape.baseline - (OVERSHOOT * fontSize) / 2;
  const lines = [...text].map((character) => (character === ',' ? line - COMMA_LIFT * fontSize : line));

  return (
    <svg
      className={classNames(styles.generic, className)}
      viewBox={`0 0 ${width.toFixed(1)} ${HEIGHT}`}
      width={`${(width / HEIGHT).toFixed(3)}em`}
      height="1em"
      role="img"
      aria-label={`${text} generic mana`}
    >
      <rect width="100%" height={HEIGHT} rx={HEIGHT / 2} />
      <text
        x={origins.map((x) => x.toFixed(1)).join(' ')}
        y={lines.map((y) => y.toFixed(1)).join(' ')}
        fontSize={fontSize.toFixed(1)}
      >
        {text}
      </text>
    </svg>
  );
};

export default GenericMana;
