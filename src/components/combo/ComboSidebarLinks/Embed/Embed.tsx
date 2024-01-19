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

  const embedCode =
`<div style="width:300px; height: ${embedHeight}px; position:relative; overflow: visible;">
  <div style="position:absolute; margin:auto; left:0; right:0; top: 0; width: 600px; height: ${embedHeight+340}">
    <object type="text/html" data="${process.env.NEXT_PUBLIC_CLIENT_URL}/combo/${combo.id}/embed" width="100%" height="${embedHeight+340}"></object>
  </div>
</div>`

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

          <div className="bg-gray-800 text-pink-900 w-full p-5 font-mono text-left">
            {embedCode}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Embed;
