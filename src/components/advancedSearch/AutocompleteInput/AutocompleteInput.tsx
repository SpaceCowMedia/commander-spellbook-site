import React, { useEffect } from "react";
import styles from "./autocompleteInput.module.scss";
import { useState } from "react";
import normalizeStringInput from "../../../lib/normalizeStringInput";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import Loader from "../../layout/Loader/Loader";

const MAX_NUMBER_OF_MATCHING_RESULTS = 20;
const AUTOCOMPLETE_DELAY = 150;
const BLUR_CLOSE_DELAY = 900;

export type AutoCompleteOption = { value: string; label: string; alias?: RegExp; normalizedValue?: string };

type Props = {
  value: string;
  inputClassName?: string;
  autocompleteOptions: AutoCompleteOption[];
  inputId: string;
  placeholder?: string;
  label?: string;
  matchAgainstOptionLabel?: boolean;
  hasError?: boolean;
  useValueForInput?: boolean;
  onChange?: (_value: string) => void;
  loading?: boolean;
  maxLength?: number;
};

const AutocompleteInput: React.FC<Props> = ({
  value,
  inputClassName,
  autocompleteOptions,
  inputId,
  label,
  matchAgainstOptionLabel,
  useValueForInput,
  placeholder,
  hasError,
  onChange,
  loading,
  maxLength,
}: Props) => {
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const resultsRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const [localValue, setLocalValue] = useState<string>(value);
  const [matchingAutoCompleteOptions, setMatchingAutoCompleteOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [arrowCounter, setArrowCounter] = useState<number>(-1);

  const active = autocompleteOptions.length > 0;
  autocompleteOptions.forEach(
    (option) => (option.normalizedValue = option.normalizedValue ?? normalizeStringInput(option.value)),
  );
  const total = matchingAutoCompleteOptions.length;
  const option = matchingAutoCompleteOptions[arrowCounter];
  let screenReaderSelectionText = "";
  if (total !== 0 && value)
    screenReaderSelectionText = option
      ? `${option.label} (${arrowCounter + 1}/${total})`
      : `${total} match${
          total > 1 ? "es" : ""
        } found for ${value}. Use the up and down arrow keys to browse the options. Use the enter or tab key to choose a selection or continue typing to narrow down the options.`;

  const lookupAutoComplete = () => {
    if (!active) return;
    if (!value) return handleClose();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = createAutocompleteTimeout();
  };

  const handleClose = () => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;

    setArrowCounter(-1);
    setMatchingAutoCompleteOptions([]);
  };

  const handleChange = (value: string) => {
    setLocalValue(value);
    onChange && onChange(value);
    lookupAutoComplete();
  };

  const handleBlur = () => {
    if (!active) return;
    setTimeout(() => {
      handleClose();
    }, BLUR_CLOSE_DELAY);
  };

  const handleAutocompleteItemHover = (index: number) => {
    setArrowCounter(index);
  };

  const handleSelect = (selection: AutoCompleteOption) => {
    const value = useValueForInput ? selection.value : selection.label;
    setLocalValue(value);
    onChange && onChange(value);
    handleClose();
  };

  const scrollToSelection = () => {
    if (!resultsRef.current) return;
    const nodes = resultsRef.current.querySelectorAll("li");
    const li = nodes[arrowCounter];
    if (!li) return;
    resultsRef.current.scrollTop = li.offsetTop - 50;
  };

  const handleArrowDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (arrowCounter + 1 < total) setArrowCounter(arrowCounter + 1);
    scrollToSelection();
  };
  const handleArrowUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (arrowCounter >= 0) setArrowCounter(arrowCounter - 1);
    scrollToSelection();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selection = matchingAutoCompleteOptions[arrowCounter];
    if (!selection) return;

    e.preventDefault();

    handleSelect(selection);
  };

  const handleTab = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    const selection = matchingAutoCompleteOptions[arrowCounter];
    if (!selection) return;

    handleSelect(selection);
  };
  const handleClick = (item: AutoCompleteOption) => {
    handleSelect(item);
    if (inputRef.current) inputRef.current.focus();
  };

  const findAllMatches = (normalizedValue: string, options?: AutoCompleteOption[]) =>
    (options || autocompleteOptions).filter((option) => {
      const mainMatch = option.normalizedValue?.includes(normalizedValue);

      if (mainMatch) return true;

      if (matchAgainstOptionLabel) {
        const labelMatch = normalizeStringInput(option.label).includes(normalizedValue);

        if (labelMatch) return true;
      }

      if (option.alias) return normalizedValue.match(option.alias);

      return false;
    });

  const findBestMatches = (totalOptions: AutoCompleteOption[], normalizedValue: string) => {
    totalOptions.sort((a, b) => {
      const indexA = a.value.indexOf(normalizedValue);
      const indexB = b.value.indexOf(normalizedValue);

      if (indexA === indexB) {
        return 0;
      }

      if (indexA === -1) {
        return 1;
      }
      if (indexB === -1) {
        return -1;
      }

      if (indexA < indexB) {
        return -1;
      } else if (indexB < indexA) {
        return 1;
      }

      return 0;
    });

    return totalOptions.slice(0, MAX_NUMBER_OF_MATCHING_RESULTS);
  };

  const createAutocompleteTimeout = () =>
    setTimeout(() => {
      if (!value) return handleClose();

      const normalizedValue = normalizeStringInput(value);
      setMatchingAutoCompleteOptions([]);

      const totalOptions = findAllMatches(normalizedValue);

      setMatchingAutoCompleteOptions(findBestMatches(totalOptions, normalizedValue));
    }, AUTOCOMPLETE_DELAY);

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      handleArrowDown(e);
    } else if (e.key === "ArrowUp") {
      handleArrowUp(e);
    } else if (e.key === "Enter") {
      handleEnter(e);
    } else if (e.key === "Tab") {
      handleTab(e);
    }
  };

  useEffect(() => {
    if (firstRender) return setFirstRender(false);
    if (!localValue || !active) return;
    const normalizedValue = normalizeStringInput(localValue);
    setMatchingAutoCompleteOptions([]);

    const totalOptions = findAllMatches(normalizedValue, autocompleteOptions);

    setMatchingAutoCompleteOptions(findBestMatches(totalOptions, normalizedValue));
  }, [localValue, active, autocompleteOptions]);

  useEffect(() => {
    setFirstRender(true);
    setLocalValue(value);
  }, [value]);

  return (
    <div className={styles.autocompleteContainer}>
      <label className="sr-only" aria-hidden htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        value={localValue}
        type="text"
        placeholder={placeholder}
        className={`input ${inputClassName} ${hasError ? "error" : ""}`}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        maxLength={maxLength}
      />
      {loading && (
        <div className="absolute right-5 top-2">
          <Loader />
        </div>
      )}
      <div role="status" aria-live="polite" className={`sr-only`}>
        {screenReaderSelectionText}
      </div>
      {total > 0 && (
        <ul ref={resultsRef} className={styles.autocompleteResults}>
          {matchingAutoCompleteOptions.map((item, index) => (
            <li
              key={index}
              className={`${styles.autocompleteResult} ${index === arrowCounter && styles.isActive}`}
              onClick={() => handleClick(item)}
              onMouseOver={() => handleAutocompleteItemHover(index)}
            >
              <TextWithMagicSymbol text={item.label} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
