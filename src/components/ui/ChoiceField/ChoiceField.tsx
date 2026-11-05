import React, { useId } from 'react';
import Icon, { SpellbookIcon } from 'components/ui/Icon/Icon';
import styles from './choiceField.module.scss';

interface Option {
  value: string;
  label: React.ReactNode;
}

interface Props {
  label: string;
  /* drawn before the label */
  icon?: SpellbookIcon;
  hint?: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}

/* One of a few options, as native radio buttons drawn like a segmented control. */
const ChoiceField: React.FC<Props> = ({ label, icon, hint, options, value, onChange }) => {
  const name = useId();
  const hintId = `${name}-hint`;
  return (
    <fieldset className={styles.field} aria-describedby={hint ? hintId : undefined}>
      <legend className={styles.legend}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
        {label}
      </legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.radio}
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.text}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default ChoiceField;
