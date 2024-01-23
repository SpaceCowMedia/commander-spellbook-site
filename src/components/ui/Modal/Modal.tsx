import Dimmer from "components/ui/Dimmer/Dimmer";
import styles from './Modal.module.scss'
import {useEffect, useState} from "react";
import classNames from "classnames";

type Props = {
  open?: boolean
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}

const Modal = ({open, children, onClose, footer}: Props) => {
  const [visible, setVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)


  useEffect(() => {
    if (open) {
      setIsOpen(true)
      setTimeout(() => setVisible(true), 50)
    }
    else {
      setVisible(false)
      setTimeout(() => setIsOpen(false), 250)
    }
  }, [open]);

  return (
    <>
      {isOpen && (
        <div className={classNames(styles.outerModalContainer, visible && styles.visible)}>
          <Dimmer dark onClick={() => onClose()} />
          <div className={classNames(styles.modal, visible && styles.inPosition)}>
            <div className={styles.content}>{children}</div>
            {footer && (
              <div className={styles.footer}>
                {footer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
