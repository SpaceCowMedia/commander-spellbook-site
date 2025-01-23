import { VariantSuggestion, VariantSuggestionStatusEnum } from '@spacecowmedia/spellbook-client';
import styles from './ComboSubmissionItem.module.scss';
import Link from 'next/link';
import React from 'react';

type Props = {
  submission: VariantSuggestion;
};

const ComboSubmissionItem: React.FC<Props> = ({ submission }: Props) => {
  let result = (
    <div>
      <p>{submission.id}</p>
      <p>{submission.status}</p>
    </div>
  );
  if (submission.status == VariantSuggestionStatusEnum.N) {
    result = (
      <Link href={`/my-submissions/${submission.id}`} key={submission.id}>
        {result}
      </Link>
    );
  }
  return <li className={styles.item}>{result}</li>;
};

export default ComboSubmissionItem;
