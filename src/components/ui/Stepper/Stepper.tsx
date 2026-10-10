import React, { useState } from 'react';
import classNames from 'lib/react/classNames';
import styles from './stepper.module.scss';

interface Props {
  id?: string;
  /* the field's name, for assistive technology and the buttons beside it */
  label: string;
  describedBy?: string;
  value: number;
  min: number;
  max: number;
  /* `max` stands for itself and everything above it, shown as "5+" */
  orMore?: boolean;
  onChange: (value: number) => void;
  compact?: boolean;
}

const PAGE = 10;

/* 1,000,000, 1 000 000, 1_000_000 and 1e6 all read as a million, and 5+ as 5. */
export function parseNumber(text: string): number | undefined {
  const plain = text.replace(/[\s,_]/g, '').replace(/(?<=\d)\+$/, '');
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(plain) ? Math.round(Number(plain)) : undefined;
}

const format = (value: number) => value.toLocaleString('en-US');

/* A spinbutton: type a number in any of the usual ways, or step it with the arrow keys, Page Up and
   Page Down, Home and End. The buttons beside it are for pointers, so the field is one tab stop. */
const Stepper: React.FC<Props> = ({ id, label, describedBy, value, min, max, orMore, onChange, compact }) => {
  const [draft, setDraft] = useState<string>();
  const typed = draft === undefined ? value : parseNumber(draft);
  const atTop = orMore && value >= max;
  const text = draft ?? `${format(value)}${atTop ? '+' : ''}`;
  const inRange = (n: number | undefined): n is number => n !== undefined && n >= min && (orMore || n <= max);

  const commit = (next: number) => {
    setDraft(undefined);
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const keys: Record<string, (from: number) => number> = {
    ArrowUp: (from) => from + 1,
    ArrowDown: (from) => from - 1,
    PageUp: (from) => from + PAGE,
    PageDown: (from) => from - PAGE,
    Home: () => min,
    End: () => max,
    Enter: (from) => from,
  };

  return (
    <div
      className={classNames(styles.stepper, compact && styles.compact)}
      style={{ '--digits': Math.max(2, text.length) } as React.CSSProperties}
    >
      <button
        type="button"
        tabIndex={-1}
        className={styles.button}
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => commit(value - 1)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        id={id}
        className={styles.input}
        type="text"
        role="spinbutton"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        aria-describedby={describedBy}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${format(value)}${atTop ? ' or more' : ''}`}
        aria-invalid={!inRange(typed) || undefined}
        value={text}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = parseNumber(event.target.value);
          if (inRange(parsed)) {
            onChange(Math.min(max, parsed));
          }
        }}
        onBlur={() => draft !== undefined && commit(typed ?? value)}
        onKeyDown={(event) => {
          const step = keys[event.key];
          if (step) {
            event.preventDefault();
            commit(step(typed ?? value));
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        className={styles.button}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => commit(value + 1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
};

export default Stepper;
