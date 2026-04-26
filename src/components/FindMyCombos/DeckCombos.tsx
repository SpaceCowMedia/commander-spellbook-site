import ComboResults from 'components/search/ComboResults/ComboResults';
import React from 'react';
import { Decklist } from 'pages/find-my-combos';
import { ResultType } from 'lib/findMyCombosResultsCache';
import pluralize from 'pluralize';

interface Props {
  currentlyParsedDeck?: Decklist;
  results: ResultType | undefined;
  format: string;
}

const DeckCombos = ({ results, format, currentlyParsedDeck }: Props) => {
  if (!results) {
    return (
      <div>
        <br />
        <h1 className="heading-subtitle">Loading Combos...</h1>
      </div>
    );
  }
  const numOfCombos = results.included.length;
  const combosInDeckHeadingText = !numOfCombos
    ? 'No combos found' + (format ? ' in the selected format' : '')
    : `${numOfCombos} ${pluralize('Combo', numOfCombos)} Found`;

  const numPotentialCombos = results.almostIncluded.length;
  const potentialCombosInDeckHeadingText = `${numPotentialCombos} Potential ${pluralize(
    'Combo',
    numPotentialCombos,
  )} Found`;

  const potentialCombosInAdditionalColorsHeadingText = `${results.almostIncludedByAddingColors.length} Potential ${pluralize(
    'Combo',
    results.almostIncludedByAddingColors.length,
  )} Found With Additional Color Requirements`;

  return (
    <div className="py-4">
      <section id="combos-in-deck-section">
        <h2 className="heading-subtitle">{combosInDeckHeadingText}</h2>
        <ComboResults results={results.included} hideVariants={true} localPageLimit={100} />
      </section>

      {!!results.almostIncluded.length && (
        <section id="potential-combos-in-deck-section">
          <h2 className="heading-subtitle">{potentialCombosInDeckHeadingText}</h2>
          <p>List of combos where your decklist is missing 1 combo piece.</p>
          <ComboResults
            results={results.almostIncluded}
            deck={currentlyParsedDeck?.deck}
            hideVariants={true}
            localPageLimit={100}
          />
        </section>
      )}

      {!!results.almostIncludedByAddingColors.length && (
        <section id="potential-combos-outside-color-identity-section">
          <h2 className="heading-subtitle">{potentialCombosInAdditionalColorsHeadingText}</h2>
          <p>
            List of combos where your decklist is missing 1 combo piece, but requires at least one additional color.
          </p>
          <ComboResults
            results={results.almostIncludedByAddingColors}
            deck={currentlyParsedDeck?.deck}
            hideVariants={true}
            localPageLimit={100}
          />
        </section>
      )}
      {!!results.almostIncludedByChangingCommanders.length && (
        <section id="potential-combos-outside-commander-section">
          <h2 className="heading-subtitle">
            {results.almostIncludedByChangingCommanders.length} Potential Combos Found With Different Commander
          </h2>
          <p>List of combos where your decklist is missing 1 combo piece, but requires changing your commander.</p>
          <ComboResults
            results={results.almostIncludedByChangingCommanders}
            deck={currentlyParsedDeck?.deck}
            hideVariants={true}
            localPageLimit={100}
          />
        </section>
      )}
      {!!results.almostIncludedByAddingColorsAndChangingCommanders.length && (
        <section id="potential-combos-outside-color-identity-and-commander-section">
          <h2 className="heading-subtitle">
            {results.almostIncludedByAddingColorsAndChangingCommanders.length} Potential Combos Found With Different
            Commander and Additional Colors
          </h2>
          <p>
            List of combos where your decklist is missing 1 combo piece, but requires changing your commander and adding
            a color.
          </p>
          <ComboResults
            results={results.almostIncludedByAddingColorsAndChangingCommanders}
            deck={currentlyParsedDeck?.deck}
            hideVariants={true}
            localPageLimit={100}
          />
        </section>
      )}
    </div>
  );
};

export default DeckCombos;
