import React, { useState } from 'react';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';

interface Props {
  checkedValue: string;
  options: { value: string; label: string }[];
  formName: string;
  label: string;
  labelIcon?: SpellbookIcon;
  description?: string;
  onChange?: (_value: string) => void;
}

const RadioSearchInput: React.FC<Props> = ({
  checkedValue,
  options,
  formName,
  label,
  labelIcon,
  description,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState<string>(checkedValue);

  const handleChange = (value: string) => {
    setLocalValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div>
      <label className="font-semibold">
        {labelIcon && <Icon name={labelIcon} />} {label}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <fieldset className="flex flex-wrap gap-7">
        <legend className="sr-only" aria-hidden="true">
          Choose settings for {label}
        </legend>
        {options.map((option, index) => (
          <label
            key={`${label}-radio-input-${index}`}
            htmlFor={`${label}-radio-input-${index}`}
            className="radio-wrapper sm:inline-flex items-center mt-3"
          >
            <input
              id={`${label}-radio-input-${index}`}
              type="radio"
              name={formName}
              className="h-5 w-5"
              checked={localValue === option.value}
              value={option.value}
              onChange={() => handleChange(option.value)}
            />
            <span className="ml-2">{option.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
};

export default RadioSearchInput;
