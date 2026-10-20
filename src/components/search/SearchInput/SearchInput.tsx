import React from 'react';
import styles from './searchInput.module.scss';
import classNames from 'lib/react/classNames';
import normalizeQuotes from 'lib/text/normalizeQuotes';

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /* Read by screen readers only, for an input that has no visible label of its own. */
  label?: string;
  inputClassName?: string;
  submitButtonClassName?: string;
  showSubmitButton?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

const SearchInput: React.FC<Props> = ({
  id,
  value,
  onChange,
  placeholder,
  label,
  inputClassName,
  submitButtonClassName,
  showSubmitButton,
  ref,
}) => (
  <div className="flex grow items-center">
    {showSubmitButton && <button className={classNames(styles.submitIcon, submitButtonClassName)} type="submit" />}
    {label && (
      <label htmlFor={id} className="sr-only text-white" aria-hidden="true">
        {label}
      </label>
    )}
    <input
      value={value}
      name="q"
      ref={ref}
      onChange={(e) => onChange(normalizeQuotes(e.target.value))}
      placeholder={placeholder}
      id={id}
      type="text"
      className={inputClassName}
    />
  </div>
);

export default SearchInput;
