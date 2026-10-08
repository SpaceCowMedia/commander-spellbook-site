import React, { useEffect, useId, useState } from 'react';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { ChoiceInput, NumberInput } from 'lib/comboWidgets/calculator';
import cn from 'lib/cn';
import styles from './comboWidget.module.scss';

interface StepperProps {
  id: string;
  /* how assistive technology names the field when no visible label points at it */
  ariaLabel?: string;
  describedBy?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

/* A number field with buttons on both sides. Typing is free while the field has focus, and the
   value is clamped to its range when it loses it. */
export const Stepper: React.FC<StepperProps> = ({ id, ariaLabel, describedBy, value, min, max, onChange, compact }) => {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next))));
  const name = ariaLabel ?? 'value';

  return (
    <div className={cn(styles.stepper, compact && styles.compact)}>
      <button
        type="button"
        className={styles.stepButton}
        aria-label={`Decrease ${name}`}
        disabled={value <= min}
        onClick={() => commit(value - 1)}
      >
        −
      </button>
      <input
        id={id}
        className={styles.stepInput}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={text}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        onChange={(event) => {
          setText(event.target.value);
          const parsed = Number(event.target.value);
          if (event.target.value.trim() !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
            onChange(Math.round(parsed));
          }
        }}
        onBlur={() => {
          const parsed = Number(text);
          const typed = text.trim() === '' || !Number.isFinite(parsed) ? value : parsed;
          const next = Math.min(max, Math.max(min, Math.round(typed)));
          setText(String(next));
          onChange(next);
        }}
      />
      <button
        type="button"
        className={styles.stepButton}
        aria-label={`Increase ${name}`}
        disabled={value >= max}
        onClick={() => commit(value + 1)}
      >
        +
      </button>
    </div>
  );
};

interface NumberFieldProps {
  input: NumberInput;
  value: number;
  onChange: (value: number) => void;
}

export const NumberField: React.FC<NumberFieldProps> = ({ input, value, onChange }) => {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {input.label}
      </label>
      <Stepper
        id={id}
        ariaLabel={input.label}
        describedBy={input.hint ? `${id}-hint` : undefined}
        value={value}
        min={input.min}
        max={input.max}
        onChange={onChange}
      />
      {input.hint && (
        <p id={`${id}-hint`} className={styles.fieldHint}>
          {input.hint}
        </p>
      )}
    </div>
  );
};

interface ChoiceFieldProps {
  input: ChoiceInput;
  value: string;
  onChange: (value: string) => void;
}

/* One of a few options, as radio buttons drawn like a segmented control. */
export const ChoiceField: React.FC<ChoiceFieldProps> = ({ input, value, onChange }) => {
  const name = useId();
  return (
    <fieldset className={cn(styles.field, styles.choiceField)}>
      <legend className={styles.fieldLabel}>{input.label}</legend>
      <div className={styles.segmented}>
        {input.options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.segmentInput}
            />
            <span className={styles.segmentLabel}>
              <TextWithMagicSymbol text={option.label} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
