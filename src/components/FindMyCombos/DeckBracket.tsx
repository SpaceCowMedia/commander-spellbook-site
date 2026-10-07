import { ClassifiedVariant, EstimateBracketResult, Variant } from '@space-cow-media/spellbook-client';
import React from 'react';
import ComboResults from 'components/search/ComboResults/ComboResults';
import { computeBracketInfo, getBracketFactors } from 'lib/brackets';
import BracketInfo, { BracketSection } from 'components/combo/BracketInfo/BracketInfo';

interface Props {
  results?: EstimateBracketResult;
}

const DeckBracket = ({ results }: Props) => {
  const info = results && computeBracketInfo(results);

  return (
    <div className="py-4">
      <BracketInfo subject="deck" tag={results?.bracketTag} factors={results && getBracketFactors(results, false)}>
        {info && (
          <>
            <ComboList title="Fast, Game-Winning, Two Card Combos" combos={info.fastGameWinningTwoCardCombos} />
            <ComboList title="Fast, Game-Winning Combos Involving Few Cards" combos={info.fastGameWinningCombos} />
            <ComboList title="Fast, Powerful, Two Card Combos" combos={info.fastPowerfulTwoCardCombos} />
            <ComboList title="Game-Winning Combos Involving Few Cards" combos={info.normalGameWinningTwoCardCombos} />
            <ComboList title="Powerful, Two Card Combos" combos={info.normalPowerfulTwoCardCombos} />
            <ComboList title="Late Game, Game-Winning, Two Card Combos" combos={info.slowGameWinningTwoCardCombos} />
            <ComboList title="Control All Opponents Combos" combos={info.controlAllOpponentsCombos} />
            <ComboList title="Control Some Opponents Combos" combos={info.controlSomeOpponentsCombos} />
            <ComboList title="Extra Turn Combos" combos={info.extraTurnsCombos} />
            <ComboList title="Lock Combos" combos={info.lockCombos} />
            <ComboList title="Mass Land Denial Combos" combos={info.massLandDenialCombos} />
            <ComboList title="Skip Turn Combos" combos={info.skipTurnsCombos} />
          </>
        )}
      </BracketInfo>
    </div>
  );
};

interface ComboListProps {
  title: string;
  combos: ClassifiedVariant[] | Variant[];
}
const ComboList = ({ title, combos }: ComboListProps) => {
  if (!combos.length) {
    return null;
  }
  return (
    <BracketSection title={`${title} (${combos.length})`}>
      <ComboResults results={combos} hideVariants={true} />
    </BracketSection>
  );
};

export default DeckBracket;
