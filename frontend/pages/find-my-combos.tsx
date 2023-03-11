import {ChangeEventHandler, useEffect, useState} from "react"
import pluralize from "pluralize";
import {ColorIdentityColors, FormattedApiResponse} from "../lib/types";
import {convertDecklistToDeck, findCombosFromDecklist} from "../lib/decklist-parser";
import debounce from 'debounce'
import styles from './find-my-combos.module.scss'
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ComboResults from "../components/search/ComboResults/ComboResults";
import ColorIdentityPicker from "../components/layout/ColorIdentityPicker/ColorIdentityPicker";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

const LOCAL_STORAGE_DECK_STORAGE_KEY =
  "commander-spellbook-combo-finder-last-decklist"

const FindMyCombos = () => {

  const [decklist, setDecklist] = useState<string>('')
  const [numberOfCardsInDeck, setNumberOfCardsInDeck] = useState<number>(0)
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false)
  const [combosInDeck, setCombosInDeck] = useState<Array<FormattedApiResponse>>([])
  const [potentialCombos, setPotentialCombos] = useState<Array<FormattedApiResponse>>([])
  const [missingDeckListCards, setMissingDeckListCards] = useState<Array<any>>([])
  const [potentialCombosColorIdentity, setPotentialCombosColorIdentity] = useState<Array<ColorIdentityColors>>(['w', 'u', 'b', 'r', 'g'])
  const [deckColorIdentity, setDeckColorIdentity] = useState<Array<ColorIdentityColors>>([])

  const numberOfCardsText = `${numberOfCardsInDeck} ${pluralize("card", numberOfCardsInDeck)}`

  const numOfCombos = combosInDeck.length
  const combosInDeckHeadingText = !numOfCombos ? 'No combos found' : `${numOfCombos} ${pluralize("Combo", numOfCombos)} Found`

  const numPotentialCombos = potentialCombos.length
  const potentialCombosInDeckHeadingText = `${numPotentialCombos} Potential ${pluralize("Combo", numPotentialCombos)} Found`


  const potentialCombosMatchingDeckColorIdentity = potentialCombos.filter((combo) => combo.colorIdentity.isWithin(deckColorIdentity))
  const potentialCombosOutsideDeckColorIdentity = potentialCombos.filter((combo) => !combo.colorIdentity.isWithin(deckColorIdentity))

  const potentialCombosOutsideDeckColorIdentityFilteredByPicker = potentialCombosOutsideDeckColorIdentity.filter((combo) => combo.colorIdentity.isWithin(potentialCombosColorIdentity))
  const potentialCombosMatchingColorIdentityPicker = potentialCombos.filter((combo) => combo.colorIdentity.isWithin(potentialCombosColorIdentity))

  const numbInAdditionalColors = potentialCombosOutsideDeckColorIdentity.length
  const potentialCombosInAdditionalColorsHeadingText = `${numbInAdditionalColors} Potential ${pluralize("Combo", numbInAdditionalColors)} Found With Additional Color Requirements`


  const lookupCombos = async (newDeckList: string) => {
    setLookupInProgress(true)
    const deck = await convertDecklistToDeck(newDeckList)
    setNumberOfCardsInDeck(deck.numberOfCards)

    setCombosInDeck([])
    setPotentialCombos([])
    setMissingDeckListCards([])
    setPotentialCombosColorIdentity(['w', 'u', 'b', 'r', 'g'])
    setDeckColorIdentity(deck.colorIdentity)

    if (deck.numberOfCards < 2) return setLookupInProgress(false)

    localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, newDeckList)

    const combos = await findCombosFromDecklist(deck.cards)

    setCombosInDeck(combos.combosInDecklist)
    setPotentialCombos(combos.potentialCombos)
    setMissingDeckListCards(combos.missingCardsForPotentialCombos)

    setLookupInProgress(false)
  }

  const clearDecklist = () => {
    setDecklist('')
    setCombosInDeck([])
    setPotentialCombos([])
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY)
  }

  useEffect(() => {
    const savedDeck = localStorage.getItem(LOCAL_STORAGE_DECK_STORAGE_KEY)

    if (!savedDeck?.trim()) return

    setDecklist(savedDeck)
    lookupCombos(savedDeck)
  }, [])

  const debouncedLookupCombos = debounce(lookupCombos, 1000)
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDecklist(e.target.value)
    debouncedLookupCombos(e.target.value)
  }

  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: Find My Combos" description="Input a decklist to generate all possible combos in your deck as well as combo suggestions." />
      <div className={`${styles.findMyCombosContainer} static-page`}>
        <ArtCircle cardName="Exploration" className="m-auto md:block hidden"/>
        <h1 className="heading-title text-center">Find My Combos</h1>
        <h2 className="heading-subtitle text-center mt-0">
          Uncover combos in your deck, and discover potential combos.
        </h2>
        <label htmlFor="decklist-input" className="sr-only">
          Copy and paste your decklist into the text box to discover the combos in
          your deck.
        </label>
        <section>

          <textarea
            id="decklist-input"
            className={styles.decklistInput}
            value={decklist}
            placeholder={`Supported decklist formats:
              Ancient Tomb
              1 Ancient Tomb
              1x Ancient Tomb
              Ancient Tomb (uma) 236
              `}
            onChange={handleInput}
          />

          {!!decklist && (
            <>
              <span id="decklist-card-count" className={`${styles.decklistCardCount} gradient relative`} aria-hidden="true">
                {numberOfCardsText}
              </span>
              <button id="clear-decklist-input" className={`${styles.clearDecklistInput} button`} onClick={clearDecklist}>
                Clear Decklist
              </button>
            </>
          )}

          {!decklist && (
            <div id="decklist-hint" className={`${styles.decklistHint} heading-subtitle`} aria-hidden="true">
              Paste your decklist
            </div>
          )}
        </section>

        <div id="decklist-app" className={styles.decklistApp}>
          {lookupInProgress && (
            <section>
              <h2 className="heading-subtitle">Loading Combos...</h2>
            </section>
          )}

          {!lookupInProgress && decklist && (
            <section id="combos-in-deck-section">
              <h2 className="heading-subtitle">{combosInDeckHeadingText}</h2>
              <ComboResults results={combosInDeck} />
            </section>
          )}

          {!lookupInProgress && !!potentialCombosMatchingDeckColorIdentity.length && (
            <section id="potential-combos-in-deck-section">
              <h2 className="heading-subtitle">{potentialCombosInDeckHeadingText}</h2>
              <p>List of combos where your decklist is missing 1 combo piece.</p>
              <ComboResults results={potentialCombosMatchingDeckColorIdentity} missingDecklistCards={missingDeckListCards}/>
            </section>
          )}

          {!lookupInProgress && !!potentialCombosOutsideDeckColorIdentity.length && (
            <section id="potential-combos-outside-color-identity-section">
              <h2 className="heading-subtitle">{potentialCombosInAdditionalColorsHeadingText}</h2>
              <p>
                List of combos where your decklist is missing 1 combo piece, but
                requires at least one additional color. Toggle the color symbols to
                filter for identity.
              </p>
              <ColorIdentityPicker onChange={setPotentialCombosColorIdentity} chosenColors={potentialCombosColorIdentity} />
              <ComboResults results={potentialCombosOutsideDeckColorIdentity} missingDecklistCards={missingDeckListCards}/>
              {!potentialCombosOutsideDeckColorIdentityFilteredByPicker.length && (
                <h2 className="heading-subtitle">
                  No Combos Found Matching the Selected Color Identity
                </h2>
              )}
            </section>
          )}


        </div>
      </div>
    </PageWrapper>
  )
}

export default FindMyCombos