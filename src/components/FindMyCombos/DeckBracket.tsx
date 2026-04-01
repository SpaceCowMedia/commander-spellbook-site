import {EstimateBracketResult, Card, Variant, ClassifiedVariant} from "@space-cow-media/spellbook-client";
import React from "react";
import CardImage from "components/layout/CardImage/CardImage";
import styles from "./DeckBracket.module.scss";
import ComboResults from "components/search/ComboResults/ComboResults";
import {BRACKET_NAME_MAP, BRACKET_RANGE_MAP} from "lib/brackets";

interface Props {
  results?: EstimateBracketResult
}



const DeckBracket = ({results}: Props) => {
  if (!results) { return (
    <div>
      <br/>
      <h1 className="heading-subtitle">Loading...</h1>
    </div>
  )
  }
  const powerLevelFactors: string[] = []
  if (results.gameChangerCards.length > 3) {
    powerLevelFactors.push(`Having more than 3 game changer cards pushes you into bracket 4+. You have ${results.gameChangerCards.length}.`)
  } else if (results.gameChangerCards.length > 0) {
    powerLevelFactors.push(`Having between 1 and 3 game changer cards pushes you into bracket 3+. You have ${results.gameChangerCards.length}.`)
  }
  if (results.extraTurnCards.length > 2) {
    powerLevelFactors.push(`Having extra turn cards pushes you into bracket 3+. You have ${results.extraTurnCards.length}.`)
  }
  if (results.massLandDenialCards.length > 2) {
    powerLevelFactors.push(`Having mass land denial cards pushes you into bracket 4+. You have ${results.massLandDenialCards.length}.`)
  }
  if (results.twoCardCombos.length > 2) {
    powerLevelFactors.push(`Having 2 two card combos pushes you into bracket 3+. You have ${results.twoCardCombos.length}.`)
  }


  return (
    <div>
      <br/>
      <h1 className="heading-subtitle">Commander Bracket Info</h1>
      <h1 className="heading-subtitle"><b>Our Estimate:</b> {BRACKET_NAME_MAP[results.bracketTag]} (Bracket {BRACKET_RANGE_MAP[results.bracketTag]})</h1>
      <ul className="list-disc mt-3 mb-12 flex justify-center">
        {powerLevelFactors.map((factor, index) => (
          <li key={index}>{factor}</li>
        ))}
      </ul>

      <CardList title="Banned Cards" cards={results.bannedCards}/>
      <CardList title="Game Changers" cards={results.gameChangerCards}/>
      <CardList title="Mass Land Denial Cards" cards={results.massLandDenialCards} />
      <CardList title="Extra Turn Cards" cards={results.extraTurnCards} />

      <ComboList title="Two Card Combos" combos={results.twoCardCombos}/>
      <ComboList title="Controll All Opponents Combos" combos={results.controlAllOpponentsCombos} />
      <ComboList title="Control Some Opponents Combos" combos={results.controlSomeOpponentsCombos} />
      <ComboList title="Extra Turn Combos" combos={results.extraTurnsCombos} />
      <ComboList title="Lock Combos" combos={results.lockCombos} />
      <ComboList title="Mass Land Denial Combos" combos={results.massLandDenialCombos} />
      <ComboList title="Skip Turn Combos" combos={results.skipTurnsCombos} />



    </div>
  )
}

interface CardListProps {
  title: React.ReactNode
  cards: Card[]
}
const CardList = ({title, cards}: CardListProps) => {
  if (!cards.length) {
    return null;
  }
  return (
    <>
      <h2 className="heading-subtitle">{title} ({cards.length})</h2>
      <div className="flex justify-center w-full mb-8 flex-wrap gap-4">
        {cards.map((card) => (
          <CardImage className={styles.card} card={card} key={card.id}/>
        ))}
      </div>
    </>
  )
}

interface ComboListProps {
  title: React.ReactNode
  combos: ClassifiedVariant[] | Variant[]
}
const ComboList = ({title, combos}: ComboListProps) => {
  if (!combos.length) {
    return null;
  }
  return (
    <>
      <h2 className="heading-subtitle">{title} ({combos.length})</h2>
      <ComboResults results={combos} hideVariants={true} />
    </>
  )
}

export default DeckBracket;
