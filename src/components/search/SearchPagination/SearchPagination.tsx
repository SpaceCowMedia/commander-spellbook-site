import React from 'react';
import styles from './searchPagination.module.scss';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onGoBack: () => void;
  onGoForward: () => void;
};

const SearchPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onGoBack, onGoForward }) => {
  return (
    <div className="px-4 mt-3 flex items-center sm:px-1">
      <div className="flex-1 flex justify-between">
        <button
          className={`back-button ${styles.navButton} ${currentPage === 1 ? 'invisible' : ''}`}
          onClick={onGoBack}
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
          className={`forward-button ${styles.navButton} ${currentPage >= totalPages ? 'invisible' : ''}`}
          onClick={onGoForward}
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
