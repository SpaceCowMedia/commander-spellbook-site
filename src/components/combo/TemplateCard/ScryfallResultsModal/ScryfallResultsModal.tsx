import Modal from "components/ui/Modal/Modal";
import {useEffect, useState} from "react";
import Dimmer from "components/ui/Dimmer/Dimmer";
import edhrecService from "services/edhrec.service";
import { ScryfallCard } from "@scryfall/api-types";
import TextWithMagicSymbol from "components/layout/TextWithMagicSymbol/TextWithMagicSymbol";
import {getScryfallImage} from "lib/getScryfallImage";

type Props = {
  scryfallApiUrl: string
  textTrigger?: React.ReactNode
  count?: number
  title?: string
}

const TEST = "https://api.scryfall.com/cards/search?order=cmc&q=c%3Ared+pow%3D3"
const ScryfallResultsModal: React.FC<Props> = ({ scryfallApiUrl, textTrigger, count, title }: Props) => {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [results, setResults] = useState<Array<ScryfallCard.Any>>([])

  const fetchResults = async () => {
    setLoading(true)
    const response = await fetch(`${scryfallApiUrl}`)
    const json = await response.json()
    setLoading(false)
    setResults(json.data)
    setNextUrl(json.next_page)
  }

  const fetchNextResults = async () => {
    if (!nextUrl) return
    setLoading(true)
    const response = await fetch(nextUrl)
    const json = await response.json()
    setResults([...results, ...json.data])
    setNextUrl(json.next_page)
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen && !results.length && !loading) fetchResults()
  }, [isOpen])

  return (
    <>
    {!textTrigger &&
      <button className="button !p-0 !px-2 !text-white font-bold text-lg z-10 w-min whitespace-nowrap h-8 text-[14px]" onClick={() => setIsOpen(true)}>
        View {!!count && count+" "}Cards
      </button>}
    {textTrigger && <span className="cursor-pointer" onClick={() => setIsOpen(true)}>{textTrigger}</span>}
      <Modal
        closeIcon
        size="large"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {loading && <Dimmer loading/>}
        {title && <h2 className="text-center text-2xl font-bold mb-8"><TextWithMagicSymbol text={"Scryfall results for “" + title + "”"}/></h2>}
        <div className="flex flex-wrap gap-3 justify-center">
          {results.map((result) => (
            <a href={edhrecService.getCardUrl(result.name)} target="_blank" rel="noopener noreferrer" key={result.id}>
              <img width="240" src={getScryfallImage(result)} alt={result.name} />
            </a>
          ))}
        </div>
        {nextUrl && (
        <div className="flex justify-center w-full">
          <button className="button" onClick={fetchNextResults}>Load More</button>
        </div>)}
      </Modal>
    </>
  )
}

export default ScryfallResultsModal
