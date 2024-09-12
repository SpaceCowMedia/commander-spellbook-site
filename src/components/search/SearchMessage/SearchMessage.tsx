import React from "react";
import styles from "./searchMessage.module.scss";

type Props = {
  errors: string;
  message: string;
  currentPage: number;
  totalPages: number;
  maxNumberOfCombosPerPage: number;
  totalResults: number;
};

const SearchMessage: React.FC<Props> = ({
  errors,
  message,
  currentPage,
  totalPages,
  totalResults,
  maxNumberOfCombosPerPage,
}) => {
  const firstResult = currentPage * maxNumberOfCombosPerPage - maxNumberOfCombosPerPage + 1;
  let lastResult = firstResult + maxNumberOfCombosPerPage - 1;
  if (firstResult > totalResults) {
    lastResult = totalResults;
  }

  let fullMessage = `${firstResult}-${lastResult} of ${message}`;
  if (totalPages <= 1) {
    fullMessage = message;
  }

  return (
    <div>
      {errors && (
        <div className={styles.searchErrors}>
          <div className="py-4 container">{errors}</div>
        </div>
      )}
      {message && (
        <div className={styles.searchDescription}>
          <div className="py-4 container">{fullMessage}</div>
        </div>
      )}
    </div>
  );
};

export default SearchMessage;
