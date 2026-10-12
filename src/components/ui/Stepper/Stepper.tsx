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
  /* the smallest change, like 0.1 for a number with one decimal */
  step?: number;
}

const PAGE = 10;

const decimalsOf = (step: number) => String(step).split('.')[1]?.length ?? 0;

/* The nearest multiple of `step`, without the float dust of 0.1 + 0.2 */
const toStep = (value: number, step: number) => Number((Math.round(value / step) * step).toFixed(decimalsOf(step)));

/* 1,000,000, 1 000 000, 1_000_000 and 1e6 all read as a million, and 5+ as 5. */
export function parseNumber(text: string, step = 1): number | undefined {
  const plain = text.replace(/[\s,_]/g, '').replace(/(?<=\d)\+$/, '');
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(plain) ? toStep(Number(plain), step) : undefined;
}

const format = (value: number, step: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: decimalsOf(step) });

/* A spinbutton: type a number in any of the usual ways, or step it with the arrow keys, Page Up and
   Page Down, Home and End. The buttons beside it are for pointers, so the field is one tab stop. */
const Stepper: React.FC<Props> = ({ id, label, describedBy, value, min, max, orMore, onChange, compact, step = 1 }) => {
  const [draft, setDraft] = useState<string>();
  const typed = draft === undefined ? value : parseNumber(draft, step);
  const atTop = orMore && value >= max;
  const text = draft ?? `${format(value, step)}${atTop ? '+' : ''}`;
  const inRange = (n: number | undefined): n is number => n !== undefined && n >= min && (orMore || n <= max);

  const commit = (next: number) => {
    setDraft(undefined);
    const clamped = Math.min(max, Math.max(min, toStep(next, step)));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const keys: Record<string, (from: number) => number> = {
    ArrowUp: (from) => from + step,
    ArrowDown: (from) => from - step,
    PageUp: (from) => from + PAGE * step,
    PageDown: (from) => from - PAGE * step,
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
        onClick={() => commit(value - step)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        id={id}
        className={styles.input}
        type="text"
        role="spinbutton"
        inputMode={step < 1 ? 'decimal' : 'numeric'}
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        aria-describedby={describedBy}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${format(value, step)}${atTop ? ' or more' : ''}`}
        aria-invalid={!inRange(typed) || undefined}
        value={text}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = parseNumber(event.target.value, step);
          if (inRange(parsed)) {
            onChange(Math.min(max, parsed));
          }
        }}
        onBlur={() => draft !== undefined && commit(typed ?? value)}
        onKeyDown={(event) => {
          const move = keys[event.key];
          if (move) {
            event.preventDefault();
            commit(move(typed ?? value));
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        className={styles.button}
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => commit(value + step)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
};

export default Stepper;
