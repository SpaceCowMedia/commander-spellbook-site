import pluralize from "pluralize";
import { useState } from "react";
import styles from "./multiSearchInput.module.scss";
import StyledSelect from "../../layout/StyledSelect/StyledSelect";
import AutocompleteInput from "../AutocompleteInput/AutocompleteInput";

type MultiSearchInputValue = {
  value: string;
  operator: string;
  error?: string;
}[];

type Props = {
  value: MultiSearchInputValue;
  autocompleteOptions?: Array<{ value: string; label: string }>;
  useValueForAutocompleteInput?: boolean;
  label: string;
  pluralLabel?: string;
  defaultPlaceholder?: string;
  operatorOptions: Array<{
    value: string;
    label: string;
    placeholder?: string;
  }>;
  defaultOperator?: string;
  onChange?: (value: MultiSearchInputValue) => void;
};

const MultiSearchInput = ({
  value,
  autocompleteOptions = [],
  useValueForAutocompleteInput,
  label,
  pluralLabel,
  defaultPlaceholder,
  operatorOptions,
  defaultOperator = ":",
  onChange,
}: Props) => {
  const [inputs, setInputs] = useState<MultiSearchInputValue>(value);

  const inputLabel = pluralLabel || pluralize(label, value.length);

  const addInput = (index: number) =>
    setInputs([
      ...inputs.slice(0, index + 1),
      { value: "", operator: defaultOperator },
      ...inputs.slice(index + 1),
    ]);

  const removeInput = (index: number) =>
    setInputs([...inputs.slice(0, index), ...inputs.slice(index + 1)]);

  const getInputId = (index: number) =>
    `${label.toLowerCase().replace(/\s/g, "-")}-input-${index}`;

  const getSelectId = (index: number) =>
    `${label.toLowerCase().replace(/\s/g, "-")}-select-${index}`;

  const getPlaceHolder = (operator: string) => {
    const isNumber = operator.split("-")[1] === "number";
    if (isNumber) return `ex: 2`;
    const option = operatorOptions.find((option) => option.value === operator);
    if (!option || !option.placeholder) return defaultPlaceholder || "";
    return option.placeholder;
  };

  const handleSelectChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index].operator = value;
    setInputs(newInputs);
    onChange && onChange(newInputs);
  };
  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index].value = value;
    setInputs(newInputs);
    onChange && onChange(newInputs);
  };

  return (
    <div>
      <label className={styles.inputLabel}>{inputLabel}</label>
      {inputs.map((input, index) => (
        <div
          key={`${label}-input-${index}`}
          className={`my-2 input-wrapper-${index}`}
        >
          <div className="sm:flex">
            <StyledSelect
              label={`Modifier for ${label}`}
              onChange={(value) => handleSelectChange(index, value)}
              id={getSelectId(index)}
              options={operatorOptions}
              selectTextClassName="sm:w-1/2 flex-grow"
              selectBackgroundClassName={`${
                input.error ? "border-danger" : "border-dark"
              } border border-b-0 sm:border-b sm:border-r-0 sm:w-1/2 flex-grow`}
            />
            <div className="w-full flex-grow flex flex-col sm:flex-row">
              <AutocompleteInput
                value={input.value}
                onChange={(value) => handleInputChange(index, value)}
                label={inputLabel}
                inputClassName="border-dark"
                autocompleteOptions={autocompleteOptions}
                inputId={getInputId(index)}
                placeholder={getPlaceHolder(input.operator)}
                hasError={!!input.error}
                useValueForInput={useValueForAutocompleteInput}
              />
              <div className="flex">
                {inputs.length > 1 && (
                  <button
                    type="button"
                    className={`minus-button ${styles.inputButton} ${
                      input.error
                        ? "bg-danger border-danger"
                        : "bg-dark border-dark"
                    } minus-button-${index}`}
                    onClick={() => removeInput(index)}
                  >
                    –
                    <span className="sr-only">
                      Remove {input.value} search query for {label}
                    </span>
                    <span aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className={`plus-button ${styles.inputButton} ${
                    input.error
                      ? "bg-danger border-danger"
                      : "bg-dark border-dark"
                  } plus-button-${index}`}
                  onClick={() => addInput(index)}
                >
                  +
                  <span className="sr-only">
                    Remove {input.value} search query for {label}
                  </span>
                  <span aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {input.error && (
            <div
              className={`input-error text-danger w-full py-2 px-4 text-center rounded-b-sm`}
            >
              {input.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MultiSearchInput;
