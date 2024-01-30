import Modal from "components/ui/Modal/Modal";
import {useEffect, useState} from "react";
import Dimmer from "components/ui/Dimmer/Dimmer";
import edhrecService from "services/edhrec.service";


type Props = {
  scryfallApiUrl: string
  textTrigger?: React.ReactNode
}

const TEST = "https://api.scryfall.com/cards/search?order=cmc&q=c%3Ared+pow%3D3"
const ScryfallResultsModal: React.FC<Props> = ({ scryfallApiUrl, textTrigger }: Props) => {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [results, setResults] = useState<Array<Record<string, any>>>([])

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
    {!textTrigger && <button className="button p-2 !text-white font-bold text-lg z-10 w-min whitespace-nowrap" onClick={() => setIsOpen(true)}>View Cards</button>}
    {textTrigger && <span className="cursor-pointer" onClick={() => setIsOpen(true)}>{textTrigger}</span>}
      <Modal
        closeIcon
        size="large"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {loading && <Dimmer loading/>}
        <div className="flex flex-wrap gap-3 justify-center">
          {results.map((result: any) => (
            <a href={edhrecService.getCardUrl(result.name)} target="_blank" rel="noopener noreferrer" key={result.id}>
              <img width="240" src={result.image_uris ? result.image_uris?.normal : result.card_faces[0].image_uris?.normal} alt={result.name} />
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
