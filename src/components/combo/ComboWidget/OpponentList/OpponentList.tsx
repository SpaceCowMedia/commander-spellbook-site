import React, { useEffect, useRef, useState } from 'react';
import Icon from 'components/ui/Icon/Icon';
import NumberField from 'components/ui/NumberField/NumberField';
import ToneBadge from 'components/ui/ToneBadge/ToneBadge';
import { TONES } from 'components/ui/tones/tones';
import type { NumberInput, Outcome } from 'lib/combo/widgets/shared/calculator';
import classNames from 'lib/react/classNames';
import useRowKeys from 'lib/react/useRowKeys';
import styles from './opponentList.module.scss';

export const MAX_OPPONENTS = 7;

type Row = Record<string, number>;

interface Props {
  fields: NumberInput[];
  rows: Row[];
  /* what happens to each opponent, in the same order */
  outcomes?: Outcome[];
  onChange: (rows: Row[]) => void;
}

/* After adding an opponent, focus goes to its first field; after removing one, to the next remove
   button, or to the add button when there is none. */
type Focus = { after: 'add' } | { after: 'remove'; index: number };

const OpponentList: React.FC<Props> = ({ fields, rows, outcomes, onChange }) => {
  const { keys, add, remove } = useRowKeys(rows.length);
  const listRef = useRef<HTMLUListElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const [focus, setFocus] = useState<Focus>();

  useEffect(() => {
    const list = listRef.current;
    if (!focus || !list) {
      return;
    }
    if (focus.after === 'add') {
      list.querySelector<HTMLInputElement>(':scope > li:last-child input')?.focus();
    } else {
      (list.querySelectorAll<HTMLButtonElement>('[data-remove]')[focus.index] ?? addRef.current)?.focus();
    }
    setFocus(undefined);
  }, [focus]);

  const addOpponent = () => {
    add();
    onChange([...rows, { ...rows[rows.length - 1] }]);
    setFocus({ after: 'add' });
  };
  const removeOpponent = (index: number) => {
    remove(index);
    onChange(rows.filter((_, i) => i !== index));
    setFocus({ after: 'remove', index });
  };
  const update = (index: number, key: string, value: number) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <section className={styles.opponents} aria-label="Opponents">
      <ul ref={listRef} className={styles.list}>
        {rows.map((row, index) => {
          const outcome = outcomes?.[index];
          const tone = outcome && outcome.tone !== 'neutral' ? TONES[outcome.tone].className : undefined;
          return (
            <li key={keys[index]} className={classNames(styles.card, tone && styles.judged, tone)}>
              <fieldset className={styles.fieldset}>
                <legend className={styles.name}>Opponent {index + 1}</legend>
                <div className={styles.fields}>
                  {fields.map((field) => (
                    <NumberField
                      key={field.key}
                      label={field.label}
                      hint={field.hint}
                      value={row[field.key]}
                      min={field.min}
                      max={field.max}
                      onChange={(value) => update(index, field.key, value)}
                      compact
                    />
                  ))}
                </div>
                {outcome && (
                  <p className={styles.outcome}>
                    <ToneBadge tone={outcome.tone} text={outcome.text} />
                  </p>
                )}
                {/* after the fields, so the keyboard reaches them first, though it shows in the corner */}
                {rows.length > 1 && (
                  <button
                    type="button"
                    data-remove
                    className={styles.remove}
                    aria-label={`Remove opponent ${index + 1}`}
                    onClick={() => removeOpponent(index)}
                  >
                    <Icon name="cross" />
                  </button>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      {rows.length < MAX_OPPONENTS && (
        <button ref={addRef} type="button" className={styles.add} onClick={addOpponent}>
          <span aria-hidden="true">
            <Icon name="plus" />
          </span>
          Add an opponent
        </button>
      )}
    </section>
  );
};

export default OpponentList;
