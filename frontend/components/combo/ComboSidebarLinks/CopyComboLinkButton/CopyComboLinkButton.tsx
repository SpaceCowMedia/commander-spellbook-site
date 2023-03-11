import {useRef, useState} from "react";
import styles from './copyComboLinkButton.module.scss'
import {Tooltip} from "react-tooltip";

type Props = {
  comboLink: string
  children: React.ReactNode
  className: string
}

const CopyComboLinkButton = ({comboLink, children, className}: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  const handleClick = () => {
    if (!inputRef.current) return
    const copyInput = inputRef.current
    copyInput.type = "text";
    copyInput.select();
    document.execCommand("copy"); // TODO - fix this deprecated method
    copyInput.type = "hidden";


    setShowCopyNotification(true)

    // TODO - handle google analytics event
    // this.$gtag.event("Copy Combo Link Clicked", {
    //   event_category: "Combo Detail Page Actions",
    // });

    setTimeout(() => {
      setShowCopyNotification(false)
    }, 2000)

    window.requestAnimationFrame(() => {
      buttonRef.current?.blur()
    })
  }

  return (
    <>
      <button data-tooltip-place="bottom" data-tooltip-id='copy-combo-tooltip' data-tooltip-content="Copy Combo Link to Clipboard"  className={className} id="copy-combo-button" ref={buttonRef} type="button" onClick={handleClick}>
        {children}
        <input
          ref={inputRef}
          aria-hidden
          type="hidden"
          className={styles.hiddenComboLinkInput}
          value={comboLink}
        />
        {showCopyNotification && (
          <div role="alert" className="sr-only">
            Combo link copied to your clipboard
          </div>
        )}
        <div aria-hidden className={`${styles.copyComboNotification} gradient w-full md:w-1/2 ${showCopyNotification && styles.show}`}>
          <div className="bg-dark p-4">Combo link copied to your clipboard!</div>
        </div>
      </button>
      <Tooltip id='copy-combo-tooltip' />
    </>

  )
}

export default CopyComboLinkButton