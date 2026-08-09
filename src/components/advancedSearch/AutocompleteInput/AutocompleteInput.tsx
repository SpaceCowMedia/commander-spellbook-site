import React, { useEffect, useMemo } from 'react';
import styles from './autocompleteInput.module.scss';
import { useState } from 'react';
import normalizeStringInput from '../../../lib/normalizeStringInput';
import normalizeQuotes from '../../../lib/normalizeQuotes';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import Loader from '../../layout/Loader/Loader';
import CardTooltip from '../../layout/CardTooltip/CardTooltip';
import { apiConfiguration } from 'services/api.service';
import { FeaturesApi, FeaturesListStatusEnum, TemplatesApi } from '@space-cow-media/spellbook-client';
import scryfall from 'scryfall-client';
import { useDebounce } from 'use-debounce';
import { formatDuration, rateLimitRetryAfterSeconds } from '../../../lib/httpErrors';

const MAX_NUMBER_OF_MATCHING_RESULTS = 20;
const AUTOCOMPLETE_DELAY = 500;
const BLUR_CLOSE_DELAY = 900;
const RATE_LIMIT_FALLBACK_SECONDS = 30;

function cardImageUrl(name: string): string {
  return `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}`;
}

export interface AutoCompleteOption {
  value: string;
  label: string;
  alias?: RegExp;
  normalizedValue: string;
  normalizedLabel: string;
}

interface Props {
  value: string;
  inputClassName?: string;
  autocompleteOptions?: readonly AutoCompleteOption[];
  cardAutocomplete?: boolean;
  resultAutocomplete?: boolean;
  templateAutocomplete?: boolean;
  inputId: string;
  placeholder?: string;
  label?: string;
  hasError?: boolean;
  useValueForInput?: boolean;
  onChange?: (_value: string) => void;
  onSelect?: (_value: string) => void;
  maxLength?: number;
}

const AutocompleteInput: React.FC<Props> = ({
  value,
  inputClassName,
  autocompleteOptions,
  cardAutocomplete,
  resultAutocomplete,
  templateAutocomplete,
  inputId,
  label,
  useValueForInput,
  placeholder,
  hasError,
  onChange,
  onSelect,
  maxLength,
}) => {
  const [firstRender, setFirstRender] = useState<boolean>(true);
  const resultsRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string>(value);
  const [debouncedLocalValue] = useDebounce(localValue, AUTOCOMPLETE_DELAY);
  const [matchingAutoCompleteOptions, setMatchingAutoCompleteOptions] = useState<AutoCompleteOption[]>([]);
  const [arrowCounter, setArrowCounter] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [rateLimitSecondsLeft, setRateLimitSecondsLeft] = useState<number>(0);
  const [rateLimitVisible, setRateLimitVisible] = useState<boolean>(false);

  const active =
    (autocompleteOptions && autocompleteOptions.length > 0) ||
    cardAutocomplete ||
    resultAutocomplete ||
    templateAutocomplete;
  const inMemory = !active || (!cardAutocomplete && !resultAutocomplete && !templateAutocomplete);

  const total = matchingAutoCompleteOptions.length;
  const option = matchingAutoCompleteOptions[arrowCounter];
  const cardImageUrlsByValue = useMemo(
    () =>
      cardAutocomplete
        ? matchingAutoCompleteOptions.reduce<Record<string, string[]>>((acc, item) => {
            acc[item.value] = [cardImageUrl(item.value)];
            return acc;
          }, {})
        : {},
    [cardAutocomplete, matchingAutoCompleteOptions],
  );
  let screenReaderSelectionText = '';
  if (total !== 0 && value) {
    screenReaderSelectionText = option
      ? `${option.label} (${arrowCounter + 1}/${total})`
      : `${total} match${
          total > 1 ? 'es' : ''
        } found for ${value}. Use the up and down arrow keys to browse the options. Use the enter or tab key to choose a selection or continue typing to narrow down the options.`;
  }

  const configuration = apiConfiguration();
  const templatesApi = new TemplatesApi(configuration);
  const feturesApi = new FeaturesApi(configuration);

  const handleLookupError = (e: unknown) => {
    const retryAfter = rateLimitRetryAfterSeconds(e, RATE_LIMIT_FALLBACK_SECONDS);
    if (retryAfter !== undefined) {
      setRateLimitedUntil(Date.now() + retryAfter * 1000);
      setRateLimitVisible(true);
      return;
    }
    console.error(e);
  };

  const findAllMatches = async (
    value: string,
    options?: readonly AutoCompleteOption[],
  ): Promise<AutoCompleteOption[]> => {
    const normalizedValue = normalizeStringInput(value);
    if (!options) {
      options = [];
      if (autocompleteOptions) {
        options = options.concat(autocompleteOptions);
      }
      if (!inMemory) {
        setLoading(true);
      }
      if (cardAutocomplete) {
        try {
          const cards: string[] = await scryfall.autocomplete(value, {
            include_extras: false,
          });
          options = options.concat(
            cards.map((card) => ({
              value: card,
              label: card,
              normalizedValue: normalizeStringInput(card),
              normalizedLabel: normalizeStringInput(card),
            })),
          );
        } catch (e) {
          handleLookupError(e);
        }
      }
      if (templateAutocomplete) {
        try {
          const templates = await templatesApi.templatesList({ q: value });
          const features = await feturesApi.featuresList({
            q: value,
            status: [FeaturesListStatusEnum.Pu],
          });
          options = options.concat(
            templates.results.map((template) => ({
              value: template.name,
              label: template.name,
              normalizedValue: normalizeStringInput(template.name),
              normalizedLabel: normalizeStringInput(template.name),
            })),
            features.results.map((feature) => ({
              value: feature.name,
              label: feature.name,
              normalizedValue: normalizeStringInput(feature.name),
              normalizedLabel: normalizeStringInput(feature.name),
            })),
          );
        } catch (e) {
          handleLookupError(e);
        }
      }
      if (resultAutocomplete) {
        try {
          const results = await feturesApi.featuresList({
            q: value,
            status: [FeaturesListStatusEnum.S, FeaturesListStatusEnum.H, FeaturesListStatusEnum.C],
          });
          options = options.concat(
            results.results.map((result) => ({
              value: result.name,
              label: result.name,
              normalizedValue: normalizeStringInput(result.name),
              normalizedLabel: normalizeStringInput(result.name),
            })),
          );
        } catch (e) {
          handleLookupError(e);
        }
      }
      if (!inMemory) {
        setLoading(false);
      }
    }
    return options.filter((option) => {
      const mainMatch = option.normalizedValue?.includes(normalizedValue);

      if (mainMatch) {
        return true;
      }

      const labelMatch = option.normalizedLabel?.includes(normalizedValue);

      if (labelMatch) {
        return true;
      }

      if (option.alias) {
        return normalizedValue.match(option.alias);
      }
      return false;
    });
  };

  const findBestMatches = (totalOptions: AutoCompleteOption[], value: string) => {
    const normalizedValue = normalizeStringInput(value);
    totalOptions.sort((a, b) => {
      const indexA = a.normalizedValue.indexOf(normalizedValue);
      const indexB = b.normalizedValue.indexOf(normalizedValue);

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

  function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const waitForAutocomplete: () => Promise<void> = async () => {
    if (inMemory) {
      await timeout(AUTOCOMPLETE_DELAY);
    }
    if (!localValue) {
      return handleClose();
    }
    setMatchingAutoCompleteOptions([]);
    const totalOptions = await findAllMatches(localValue, autocompleteOptions);
    const matchingOptions = findBestMatches(totalOptions, localValue);
    setMatchingAutoCompleteOptions(matchingOptions);
  };

  const lookupAutoComplete = async () => {
    if (!active || rateLimitedUntil !== null) {
      return;
    }
    if (!localValue) {
      return handleClose();
    }
    waitForAutocomplete();
  };

  const handleClose = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = 0;
    }

    setArrowCounter(-1);
    setMatchingAutoCompleteOptions([]);
    setRateLimitVisible(false);
  };

  const handleChange = (rawValue: string) => {
    const value = normalizeQuotes(rawValue);
    setLocalValue(value);
    if (rateLimitedUntil !== null) {
      setRateLimitVisible(true);
    }
    if (onChange) {
      onChange(value);
    }
  };

  useEffect(() => {
    if (rateLimitedUntil === null) {
      setRateLimitSecondsLeft(0);
      setRateLimitVisible(false);
      return;
    }
    const tick = () => {
      const secondsLeft = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setRateLimitedUntil(null);
      } else {
        setRateLimitSecondsLeft(secondsLeft);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [rateLimitedUntil]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    if (!debouncedLocalValue || !active) {
      return;
    }
    lookupAutoComplete();
  }, [debouncedLocalValue, active, autocompleteOptions, rateLimitedUntil]);

  const handleBlur = () => {
    if (!active) {
      return;
    }
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
    if (onChange) {
      onChange(value);
    }
    if (onSelect) {
      onSelect(value);
    }
    setFirstRender(true);
    handleClose();
  };

  const scrollToSelection = () => {
    if (!resultsRef.current) {
      return;
    }
    const nodes = resultsRef.current.querySelectorAll('li');
    const li = nodes[arrowCounter];
    if (!li) {
      return;
    }
    resultsRef.current.scrollTop = li.offsetTop - 50;
  };

  const handleArrowDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (arrowCounter + 1 < total) {
      setArrowCounter(arrowCounter + 1);
    }
    scrollToSelection();
  };
  const handleArrowUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (arrowCounter >= 0) {
      setArrowCounter(arrowCounter - 1);
    }
    scrollToSelection();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selection = matchingAutoCompleteOptions[arrowCounter];
    if (!selection) {
      return;
    }
    e.preventDefault();
    handleSelect(selection);
  };

  const handleTab = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selection = matchingAutoCompleteOptions[arrowCounter];
    if (!selection) {
      return;
    }
    e.preventDefault();
    handleSelect(selection);
  };

  const handleClick = (item: AutoCompleteOption) => {
    handleSelect(item);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      handleArrowDown(e);
    } else if (e.key === 'ArrowUp') {
      handleArrowUp(e);
    } else if (e.key === 'Enter') {
      handleEnter(e);
    } else if (e.key === 'Tab') {
      handleTab(e);
    }
  };

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
        className={`input ${inputClassName} ${hasError ? 'error' : ''}`}
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
      {rateLimitVisible && rateLimitSecondsLeft > 0 && (
        <div role="status" aria-live="polite" className={styles.autocompleteNotice}>
          Too many suggestion requests. Please wait {formatDuration(rateLimitSecondsLeft)} before typing again.
        </div>
      )}
      {!rateLimitVisible && total > 0 && (
        <ul ref={resultsRef} className={styles.autocompleteResults}>
          {matchingAutoCompleteOptions.map((item, index) => (
            <li
              key={index}
              className={`${inputClassName} ${styles.autocompleteResult} ${index === arrowCounter && styles.isActive}`}
              onClick={() => handleClick(item)}
              onMouseOver={() => handleAutocompleteItemHover(index)}
            >
              {cardAutocomplete ? (
                <CardTooltip images={cardImageUrlsByValue[item.value]} disableTapPreview>
                  <TextWithMagicSymbol text={item.label} />
                </CardTooltip>
              ) : (
                <TextWithMagicSymbol text={item.label} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
