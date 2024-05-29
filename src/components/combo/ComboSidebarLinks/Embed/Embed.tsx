import {Variant} from "lib/types";
import Icon from "components/layout/Icon/Icon";
import {useState} from "react";
import Modal from "components/ui/Modal/Modal";


type Props = {
  combo: Variant;
}


const Embed = ({combo}: Props) => {

  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const embedHeight = combo.produces.length * 24 + combo.uses.length * 24 + 24 + 48 + 16

  let query = `v=1`
  query += `&uses=${encodeURIComponent(JSON.stringify(combo.uses.map(card => card.card.name)))}`
  query += `&produces=${encodeURIComponent(JSON.stringify(combo.produces.map(feature => feature.hasOwnProperty('name') ? feature.name : feature.feature.name)))}`
  query += `&id=${combo.id}`
  query += `&color=${combo.identity}`
  query += `&extraRequirementCount=${combo.requires.length + (combo.otherPrerequisites ? combo.otherPrerequisites.split(".").filter(s => s.trim().length).length : 0)}`

  // The empty iframe ensures that wordpress detects the embed
  const embedCode =
`<div style="width:100%; position:relative; overflow: visible; display: flex; justify-content: center" id="${combo.id}">
    <img alt="csb logo" src="${process.env.NEXT_PUBLIC_CLIENT_URL}/images/gear.svg" width="300" id="csbLoad"/>
    <script id="${combo.id}" src="${process.env.NEXT_PUBLIC_CLIENT_URL}/embed.js?${query}"></script>
</div>
<iframe height="0" width="0" src="."></iframe>
`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="button w-full">
        <Icon name="code"/>Embed
      </button>
      <Modal
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        footer={
          <button onClick={handleCopy} className="button">
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        }
      >
        <div>
          <p>Embed the following code in your website for a combo preview:</p>

          <div className="bg-gray-800 text-pink-700 w-full p-5 font-mono text-left break-words">
            {embedCode}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Embed;
