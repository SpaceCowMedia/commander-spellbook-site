import React, { useRef, useState } from 'react';
import styles from './copyLinkButton.module.scss';
import { Tooltip } from 'react-tooltip';
import { event } from 'lib/googleAnalytics';

interface Props {
  link: string;
  children: React.ReactNode;
  className: string;
  subject: string;
  analyticsCategory: string;
}

const CopyLinkButton: React.FC<Props> = ({ link, children, className, subject, analyticsCategory }) => {
  const subjectId = subject.toLowerCase();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleClick = () => {
    if (!inputRef.current) {
      return;
    }
    const copyInput = inputRef.current;
    copyInput.type = 'text';
    copyInput.select();
    if (!navigator.clipboard) {
      document.execCommand('copy');
    } else {
      navigator.clipboard.writeText(copyInput.value);
    }
    copyInput.type = 'hidden';

    setShowCopyNotification(true);

    event({
      action: `Copy ${subject} Link Clicked`,
      category: analyticsCategory,
    });

    setTimeout(() => {
      setShowCopyNotification(false);
    }, 2000);

    window.requestAnimationFrame(() => {
      buttonRef.current?.blur();
    });
  };

  return (
    <>
      <button
        data-tooltip-place="bottom"
        data-tooltip-id={`copy-${subjectId}-tooltip`}
        data-tooltip-content={`Copy ${subject} Link to Clipboard`}
        className={className}
        id={`copy-${subjectId}-button`}
        ref={buttonRef}
        type="button"
        onClick={handleClick}
      >
        {children}
        <input ref={inputRef} aria-hidden type="hidden" className={styles.hiddenLinkInput} value={link} />
        {showCopyNotification && (
          <div role="alert" className="sr-only">
            {subject} link copied to your clipboard
          </div>
        )}
        <div
          aria-hidden
          className={`${styles.copyNotification} gradient w-full md:w-1/2 ${showCopyNotification && styles.show}`}
        >
          <div className="bg-dark p-4">{subject} link copied to your clipboard!</div>
        </div>
      </button>
      <Tooltip id={`copy-${subjectId}-tooltip`} />
    </>
  );
};

export default CopyLinkButton;
