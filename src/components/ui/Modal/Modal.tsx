import styles from './Modal.module.scss';
import cn from 'lib/cn';
import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from 'react';
import ReactDOM from 'react-dom';
import Icon from 'components/layout/Icon/Icon';
import { MODAL_RESIZE } from 'lib/viewTransitions';

// A modal dialog sits in the top layer, above anything portalled to the body, so popups inside it portal into it.
export const ModalPortalContext = createContext<HTMLElement | null>(null);

// How many modals the content is nested in, so that it can open no further ones.
export const ModalDepthContext = createContext(0);

interface Props {
  open?: boolean;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeIcon?: boolean;
}

const isOutside = (dialog: HTMLElement, event: React.MouseEvent) => {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
};

const Modal: React.FC<Props> = ({ open = false, children, onClose, footer, size, closeIcon }) => {
  // The ref opens the dialog in the commit that mounts it, so that a view transition captures it open.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  // Closed but still fading out, so its content stays until it is gone.
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const pressedOutside = useRef(false);
  const depth = useContext(ModalDepthContext);

  if (open !== wasOpen) {
    setWasOpen(open);
    setClosing(!open);
  }

  const attachDialog = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    setDialog(node);
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished)).then(() => setClosing(false));
    }
  }, [open]);

  if ((!open && !closing) || typeof document === 'undefined') {
    return null;
  }

  // Content regrouped in place resizes the whole dialog as one snapshot, its own name told apart from any other modal's.
  return ReactDOM.createPortal(
    <ViewTransition update={MODAL_RESIZE} default="none">
      <dialog
        ref={attachDialog}
        className={cn(styles.modal, size && styles[size])}
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        onPointerDown={(event) => {
          pressedOutside.current = event.target === dialog && isOutside(dialog, event);
        }}
        onClick={(event) => {
          if (pressedOutside.current && event.target === dialog && isOutside(dialog, event)) {
            onClose();
          }
        }}
      >
        <ModalPortalContext value={dialog}>
          <ModalDepthContext value={depth + 1}>
            {closeIcon && (
              <div className={styles.closeIcon} onClick={() => onClose()}>
                <Icon name="close" />
              </div>
            )}
            <div className={styles.content}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </ModalDepthContext>
        </ModalPortalContext>
      </dialog>
    </ViewTransition>,
    document.body,
  );
};

export default Modal;
