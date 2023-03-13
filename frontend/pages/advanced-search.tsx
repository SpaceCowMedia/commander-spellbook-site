import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import Link from "next/link";
import MultiSearchInput from "../components/advancedSearch/MultiSearchInput/MultiSearchInput";
import { DEFAULT_VENDOR } from "../lib/constants";
import { useEffect, useState } from "react";
import COLOR_AUTOCOMPLETES from "../lib/colorAutocompletes";
import styles from "./advanced-search.module.scss";
import RadioSearchInput from "../components/advancedSearch/RadioSearchInput/RadioSearchInput";
import { useRouter } from "next/router";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

const CARD_OPERATOR_OPTIONS = [
  {
    value: ":",
    label: "Has card with name",
    placeholder: "ex: isochron",
  },
  {
    value: "=",
    label: "Has card with exact name",
    placeholder: "ex: basalt monolith",
  },
  {
    value: ":-exclude",
    label: "Does not have card with name",
    placeholder: "ex: isochron",
  },
  {
    value: "=-exclude",
    label: "Does not have card with exact name",
    placeholder: "ex: basalt monolith",
  },
];

const CARD_AMOUNT_OPERATOR_OPTIONS = [
  { value: "=-number", label: "Contains exactly x cards (number)" },
  { value: ">-number", label: "Contains more than x cards (number)" },
  { value: "<-number", label: "Contains less than x cards (number)" },
];

const COLOR_IDENTITY_OPERATOR_OPTIONS = [
  {
    value: ":",
    label: "Is within the color identity",
  },
  {
    value: "=",
    label: "Is exactly the color identity",
  },
  {
    value: ":-exclude",
    label: "Is not within the color identity",
  },
  {
    value: "=-exclude",
    label: "Is not exactly the color identity",
  },
  { value: ">-number", label: "Contains more than x colors (number)" },
  { value: "<-number", label: "Contains less than x colors (number)" },
  { value: "=-number", label: "Contains exactly x colors (number)" },
];

const COMBO_DATA_OPERATOR_OPTIONS = [
  {
    value: ":",
    label: "Contains the phrase",
    placeholder: "ex: mana, untap, additional",
  },
  { value: "=", label: "Is exactly" },
  {
    value: ":-exclude",
    label: "Does not contain the phrase",
    placeholder: "ex: mana, untap, additional",
  },
  { value: "=-exclude", label: "Is not exactly" },
  { value: ">-number", label: "Contains more than x (number)" },
  { value: "<-number", label: "Contains less than x (number)" },
  { value: "=-number", label: "Contains exactly x (number)" },
];

const PRICE_OPTIONS = [
  { value: "<-number", label: "Costs less than" },
  { value: ">-number", label: "Costs more than" },
  { value: "=-number", label: "Costs exactly" },
];

const POPULARITY_OPTIONS = [
  { value: "<-number", label: "In less than x decks (number)" },
  { value: ">-number", label: "In more than x decks (number)" },
  { value: "=-number", label: "In exactly x decks (number)" },
];

const VENDOR_OPTIONS = [
  {
    value: "cardkingdom",
    label: "Card Kingdom",
  },
  {
    value: "tcgplayer",
    label: "TCGplayer",
  },
];

const PREVIEWED_OPTIONS = [
  {
    value: "include",
    label:
      "Include combos with newly previewed cards in search results (default search behavior)",
  },
  {
    value: "exclude",
    label: "Exclude combos with newly previewed cards in search results",
  },
  {
    value: "is",
    label: "Only show combos with newly previewed cards",
  },
];

const BANNED_OPTIONS = [
  {
    value: "exclude",
    label:
      "Exclude combos with banned cards in search results (default search behavior)",
  },
  {
    value: "include",
    label: "Include combos with banned cards in search results",
  },
  {
    value: "is",
    label: "Only show combos with banned cards",
  },
];

type InputData = {
  value: string;
  operator: string;
  error?: string;
};
type OperatorOption = {
  value: string;
  label: string;
  placeholder?: string;
};

type AutoCompleteOption = {
  value: string;
  label: string;
  alias?: RegExp;
};

type Data = {
  cardNameAutocompletes: AutoCompleteOption[];
  resultAutocompletes: AutoCompleteOption[];
  colorAutocompletes: AutoCompleteOption[];

  cards: InputData[];

  cardAmounts: InputData[];

  colorIdentity: InputData[];

  prerequisites: InputData[];
  steps: InputData[];
  results: InputData[];

  price: InputData[];

  popularity: InputData[];

  vendor: string;

  validationError: string;

  previewed: string;

  banned: string;
};

const DEFAULT_PREVIEWED_VALUE = "include";
const DEFAULT_BANNED_VALUE = "exclude";

const AdvancedSearch = () => {
  const router = useRouter();

  const [formState, setFormStateHook] = useState<Data>({
    cardNameAutocompletes: require("../../autocomplete-data/cards.json"),
    resultAutocompletes: require("../../autocomplete-data/results.json"),
    colorAutocompletes: COLOR_AUTOCOMPLETES,

    cards: [{ value: "", operator: ":" }],
    cardAmounts: [{ value: "", operator: "=-number" }],
    colorIdentity: [{ value: "", operator: ":" }],
    prerequisites: [{ value: "", operator: ":" }],
    steps: [{ value: "", operator: ":" }],
    results: [{ value: "", operator: ":" }],
    price: [{ value: "", operator: "<-number" }],
    popularity: [{ value: "", operator: "<-number" }],
    vendor: DEFAULT_VENDOR,
    previewed: DEFAULT_PREVIEWED_VALUE,
    banned: DEFAULT_BANNED_VALUE,
    validationError: "",
  });

  const {
    cardNameAutocompletes,
    resultAutocompletes,
    colorAutocompletes,
    cards,
    cardAmounts,
    colorIdentity,
    prerequisites,
    steps,
    results,
    price,
    popularity,
    vendor,
    previewed,
    banned,
    validationError,
  } = formState;

  const setFormState = (changes: Partial<typeof formState>) => {
    setFormStateHook({ ...formState, ...changes });
  };

  const hasPriceInQuery = !!price.find(({ value }) => !!value.trim());

  const validate = () => {
    let hasValidationError = false;

    const newFormState = { ...formState };

    function val(input: InputData) {
      input.error = "";

      if (input.value.includes("'") && input.value.includes('"')) {
        input.error =
          "Contains both single and double quotes. A card name may only use one kind.";
      }

      if (
        input.operator.split("-")[1] === "number" &&
        !Number.isInteger(Number(input.value))
      ) {
        input.error = "Contains a non-integer. Use a full number instead.";
      }

      if (input.error) {
        hasValidationError = true;
      }
    }

    newFormState.cards.forEach(val);
    newFormState.cardAmounts.forEach(val);
    newFormState.colorIdentity.forEach(val);
    newFormState.prerequisites.forEach(val);
    newFormState.steps.forEach(val);
    newFormState.results.forEach(val);
    newFormState.price.forEach(val);
    newFormState.popularity.forEach(val);

    setFormState(newFormState);

    return hasValidationError;
  };

  useEffect(() => {
    validate();
  }, [
    cards,
    cardAmounts,
    colorIdentity,
    prerequisites,
    steps,
    results,
    price,
    popularity,
  ]);

  const getQuery = () => {
    let query = "";

    function makeQueryFunction(
      key: string
    ): Parameters<typeof Array.prototype.forEach>[0] {
      return (input: InputData) => {
        const value = input.value.trim();
        const isSimpleValue = value.match(/^[\w\d]*$/);
        const modifier = input.operator.split("-")[1];
        const isNumericOperator = modifier === "number";
        const isExclusionOperator = modifier === "exclude";
        let operator = input.operator.split("-")[0];
        let keyInQuery = key;
        const isSimpleCardValue =
          isSimpleValue &&
          keyInQuery === "card" &&
          operator === ":" &&
          !isExclusionOperator;

        if (!value) {
          return;
        }

        let quotes = "";

        if (!isSimpleValue) {
          quotes = '"';

          if (value.includes(quotes)) {
            quotes = "'";
          }
        }

        if (isSimpleCardValue) {
          keyInQuery = "";
          operator = "";
        } else if (isNumericOperator) {
          if (keyInQuery === "ci") {
            keyInQuery = "colors";
          } else if (keyInQuery === "pre") {
            keyInQuery = "prerequisites";
          } else if (keyInQuery === "popularity") {
            keyInQuery = "decks";
          } else if (keyInQuery !== "price") {
            keyInQuery += "s";
          }
        } else if (isExclusionOperator) {
          keyInQuery = `-${keyInQuery}`;
        }

        query += ` ${keyInQuery}${operator}${quotes}${value}${quotes}`;
      };
    }
    cards.forEach(makeQueryFunction("card"));
    cardAmounts.forEach(makeQueryFunction("card"));
    colorIdentity.forEach(makeQueryFunction("ci"));
    prerequisites.forEach(makeQueryFunction("pre"));
    steps.forEach(makeQueryFunction("step"));
    results.forEach(makeQueryFunction("result"));
    price.forEach(makeQueryFunction("price"));
    popularity.forEach(makeQueryFunction("popularity"));

    if (previewed !== DEFAULT_PREVIEWED_VALUE) {
      query += ` ${previewed}:previewed`;
    }
    if (banned !== DEFAULT_BANNED_VALUE) {
      query += ` ${banned}:banned`;
    }
    if (vendor !== DEFAULT_VENDOR && hasPriceInQuery) {
      query += ` vendor:${vendor}`;
    }

    query = query.trim();

    return query;
  };

  const query = getQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query)
      return setFormState({ validationError: "No search queries entered." });

    if (validate())
      return setFormState({
        validationError:
          "Check for errors in your search terms before submitting.",
      });

    router.push({
      pathname: "/search/",
      query: {
        q: `${query}`,
      },
    });
  };

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Advanced Search"
        description="Advanced search form for searching through Commander Spellbook EDH combos."
      />
      <div className={`${styles.container} container`}>
        <ArtCircle cardName="Tribute Mage" className="m-auto md:block hidden" />
        <h1 className="heading-title">Advanced Search</h1>
        <p className="text-center">
          For more information on the syntax for searches,&nbsp;
          <Link href="/syntax-guide/">check out the Syntax Guide.</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div id="card-name-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={cards}
            onChange={(cards) => setFormState({ cards })}
            autocompleteOptions={cardNameAutocompletes}
            label="Card Names"
            operatorOptions={CARD_OPERATOR_OPTIONS}
          />
        </div>

        <div id="card-amount-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={cardAmounts}
            onChange={(cardAmounts) => setFormState({ cardAmounts })}
            label="Number of Cards"
            pluralLabel="Number of Cards"
            operatorOptions={CARD_AMOUNT_OPERATOR_OPTIONS}
            defaultOperator="=-number"
          />
        </div>

        <div
          id="color-identity-inputs"
          className={`${styles.container} container`}
        >
          <MultiSearchInput
            value={colorIdentity}
            onChange={(colorIdentity) => setFormState({ colorIdentity })}
            label="Color Identity"
            pluralLabel="Color Identities"
            operatorOptions={COLOR_IDENTITY_OPERATOR_OPTIONS}
            autocompleteOptions={colorAutocompletes}
            defaultPlaceholder="ex: wug, temur, colorless, black"
            useValueForAutocompleteInput
          />
        </div>

        <div
          id="prerequisite-inputs"
          className={`${styles.container} container`}
        >
          <MultiSearchInput
            value={prerequisites}
            onChange={(prerequisites) => setFormState({ prerequisites })}
            defaultPlaceholder="all permanents on the battlefield"
            label="Prerequisite"
            operatorOptions={COMBO_DATA_OPERATOR_OPTIONS}
          />
        </div>

        <div id="step-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={steps}
            onChange={(steps) => setFormState({ steps })}
            label="Step"
            operatorOptions={COMBO_DATA_OPERATOR_OPTIONS}
          />
        </div>

        <div id="result-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={results}
            onChange={(results) => setFormState({ results })}
            autocompleteOptions={resultAutocompletes}
            label="Result"
            operatorOptions={COMBO_DATA_OPERATOR_OPTIONS}
            defaultPlaceholder="ex: win the game"
          />
        </div>

        <div id="price-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={price}
            onChange={(price) => setFormState({ price })}
            label="Price"
            pluralLabel="Price"
            operatorOptions={PRICE_OPTIONS}
            defaultOperator="<-number"
          />
        </div>

        {hasPriceInQuery && (
          <div id="vendor" className={`${styles.container} container`}>
            <RadioSearchInput
              checkedValue={vendor}
              options={VENDOR_OPTIONS}
              formName="vendor"
              label="Card Vendor"
              onChange={(vendor) => setFormState({ vendor })}
            />
          </div>
        )}

        <div id="popularity-inputs" className={`${styles.container} container`}>
          <MultiSearchInput
            value={popularity}
            onChange={(popularity) => setFormState({ popularity })}
            label="Popularity"
            pluralLabel="Popularity"
            operatorOptions={POPULARITY_OPTIONS}
            defaultOperator="<-number"
          />
        </div>

        <div id="previewed-combos" className={`${styles.container} container`}>
          <RadioSearchInput
            checkedValue={previewed}
            options={PREVIEWED_OPTIONS}
            formName="previewed"
            label="Previewed / Spoiled Combos"
            onChange={(previewed) => setFormState({ previewed })}
          />
        </div>

        <div id="banned-combos" className={`${styles.container} container`}>
          <RadioSearchInput
            checkedValue={banned}
            options={BANNED_OPTIONS}
            formName="banned"
            label="Banned Combos"
            onChange={(banned) => setFormState({ banned })}
          />
        </div>

        <div className={`${styles.container} container text-center pb-8`}>
          <div className="flex flex-row items-center">
            <button
              id="advanced-search-submit-button"
              type="submit"
              className="border border-link text-link p-4 rounded-l-sm hover:bg-link hover:text-white"
            >
              Search&nbsp;With&nbsp;Query
            </button>

            <div
              id="search-query"
              className="w-full font-mono border border-gray-200 bg-gray-200 rounded-r-sm text-left p-4 truncate"
              aria-hidden="true"
            >
              {query ? (
                <span>{query}</span>
              ) : (
                <span className="text-dark">
                  (your query will populate here when you've entered any search
                  terms)
                </span>
              )}
            </div>
          </div>

          <div
            id="advanced-search-validation-error"
            className="text-danger p-4"
          >
            {validationError}
          </div>
        </div>
      </form>
    </PageWrapper>
  );
};

export default AdvancedSearch;
