import { VariantSuggestion, VariantSuggestionStatusEnum } from '@spacecowmedia/spellbook-client';
import Link from 'next/link';
import React from 'react';

type Props = {
  submission: VariantSuggestion;
};

const ComboSubmissionItem: React.FC<Props> = ({ submission }: Props) => {
  const result = <p>{submission.id}</p>;
  if (submission.status == VariantSuggestionStatusEnum.N) {
    return (
      <Link href={`/my-submissions/${submission.id}`} key={submission.id}>
        {result}
      </Link>
    );
  }
  return result;
};

export default ComboSubmissionItem;
