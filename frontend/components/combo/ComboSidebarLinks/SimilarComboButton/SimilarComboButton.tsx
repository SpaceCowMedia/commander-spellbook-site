import {useEffect, useState} from "react"
import search from "../../../../lib/search";
import Link from 'next/link'
import { event } from "../../../../lib/googleAnalytics";

type Props = {
  cards: string[],
  comboId: string,
}

const SimilarComboButton = ({cards, comboId}: Props) => {
  const [numberOfSimilarCombos, setNumberOfSimilarCombos] = useState(0)

  const similarSearchString = cards.reduce((accum, name) => {
    let quotes = '"';
    if (name.includes('"')) {
      quotes = "'";
    }
    return accum + ` card=${quotes}${name}${quotes}`;
  }, `-spellbookid:${comboId}`)

  const lookupSimilarCombos = async () => {
    const result = await search(similarSearchString)
    setNumberOfSimilarCombos(result.combos.length)
  }

  useEffect(() => {
    lookupSimilarCombos()
  }, [])

  if (!numberOfSimilarCombos) return null

  const text = numberOfSimilarCombos === 1 ? 'View Another Combo Using these Cards' : `Find ${numberOfSimilarCombos} Other Combos Using These Cards`

  const handleClick = () => {
    event({
      action: "Combos Using These Cards Button Clicked",
      category: "Combo Detail Page Actions",
    });
  }

  return (
    <Link onClick={handleClick} href={`/search/?q=${similarSearchString}`}>
      <button className="button w-full" id="has-similiar-combos" >
        {text}
      </button>
    </Link>
  )

}

export default SimilarComboButton
