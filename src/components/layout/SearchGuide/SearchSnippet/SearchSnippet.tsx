import React from 'react';
import Link from 'next/link';
import styles from './searchSnippet.module.scss';

type Props = {
  search: string;
  description: string;
};

const SearchSnippet: React.FC<Props> = ({ search, description }: Props) => {
  const link = `/search/?q=${search}`;

  return (
    <Link href={link} className={styles.link}>
      <div className={styles.searchSnippet}>
        <div className={`${styles.searchSnippetHeader} gradient`}>{search}</div>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
};

export default SearchSnippet;
