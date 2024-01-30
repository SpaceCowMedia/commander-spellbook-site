import Dimmer from "components/ui/Dimmer/Dimmer";
import styles from './Modal.module.scss'
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import ReactDOM from "react-dom";
import Icon from "components/layout/Icon/Icon";

type Props = {
  open?: boolean
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  closeIcon?: boolean
}

const Modal = ({open, children, onClose, footer, size, closeIcon}: Props) => {
  const [visible, setVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const bodyRef = useRef<HTMLBodyElement>()


  useEffect(() => {
    bodyRef.current = document.querySelector('body') as HTMLBodyElement
    if (open) {
      setIsOpen(true)
      bodyRef.current.style.overflow = 'hidden'
      setTimeout(() => setVisible(true), 50)
    }
    else {
      setVisible(false)
      bodyRef.current.style.overflow = 'auto'
      setTimeout(() => setIsOpen(false), 250)
    }
  }, [open]);

  return (
    <>
      {isOpen && ReactDOM.createPortal(
        <div className={classNames(styles.outerModalContainer, visible && styles.visible)}>
          <Dimmer dark onClick={() => onClose()} />
          <div className={classNames(styles.modal, visible && styles.inPosition, size && styles[size])}>
            {closeIcon && (
              <div className={styles.closeIcon} onClick={() => onClose()}>
                <Icon name="close" />
              </div>
            )}
            <div className={styles.content}>{children}</div>
            {footer && (
              <div className={styles.footer}>
                {footer}
              </div>
            )}
          </div>
        </div>, bodyRef.current as HTMLBodyElement)
      }
    </>
  )
}

export default Modal
