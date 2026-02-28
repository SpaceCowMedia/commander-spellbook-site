import React from 'react';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';

interface Props {
  checkedValue: string;
  options: readonly { value: string; label: string }[];
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (onChange) {
      onChange(value);
    }
  };
  return (
    <div>
      <span className="font-semibold">
        {labelIcon && <Icon name={labelIcon} />} {label}
      </span>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <fieldset className="flex flex-wrap">
        <legend className="sr-only" aria-hidden="true">
          Choose settings for {label}
        </legend>
        {options.map((option, index) => (
          <div key={`${formName}-radio-option-${index}`} className="flex items-center mr-4">
            <input
              id={`${formName}-radio-input-${index}`}
              type="radio"
              name={formName}
              className="h-5 w-5 mt-3 ml-2 mr-1"
              defaultChecked={checkedValue === option.value}
              value={option.value}
              onChange={handleChange}
            />
            <label
              htmlFor={`${formName}-radio-input-${index}`}
              className="radio-wrapper sm:inline-flex items-center mt-3 mr-4"
            >
              {option.label}
            </label>
          </div>
        ))}
      </fieldset>
    </div>
  );
};

export default RadioSearchInput;
