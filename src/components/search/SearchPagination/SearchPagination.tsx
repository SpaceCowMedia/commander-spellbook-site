import React from 'react';
import styles from './searchPagination.module.scss';

interface PaginationProps {
  id: string;
  currentPage: number;
  hasNextPage: boolean;
  onGoBack: () => unknown;
  onGoForward: () => unknown;
}

const visibleButton = (id: string) => {
  const button = document.getElementById(id);
  return button && !button.classList.contains('invisible') ? button : undefined;
};

const navigateKeepingFocus =
  (navigate: () => unknown, buttonId: string, fallbackId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    const keepFocus = event.currentTarget.matches(':focus-visible');
    const navigation = Promise.resolve(navigate());
    if (keepFocus) {
      navigation.then(() => (visibleButton(buttonId) ?? visibleButton(fallbackId))?.focus({ preventScroll: true }));
    }
  };

const SearchPagination: React.FC<PaginationProps> = ({ id, currentPage, hasNextPage, onGoBack, onGoForward }) => {
  const backId = `${id}-back`;
  const forwardId = `${id}-forward`;
  return (
    <div id={id} className="px-4 mt-3 flex items-center sm:px-1">
      <div className="flex-1 flex justify-between">
        <button
          id={backId}
          className={`back-button ${styles.navButton} ${currentPage === 1 ? 'invisible' : ''}`}
          onClick={navigateKeepingFocus(onGoBack, backId, forwardId)}
        >
          <svg
            className={styles.navIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Previous <span className="sr-only">78 combos</span>
        </button>

        <button
          id={forwardId}
          className={`forward-button ${styles.navButton} ${!hasNextPage ? 'invisible' : ''}`}
          onClick={navigateKeepingFocus(onGoForward, forwardId, backId)}
        >
          Next <span className="sr-only">78 combos</span>
          <svg
            className={styles.navIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchPagination;
