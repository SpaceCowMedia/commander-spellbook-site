import { VariantSuggestion } from '@spacecowmedia/spellbook-client';
import Link from 'next/link';
import React from 'react';

type Props = {
  submission: VariantSuggestion;
};

const ComboSubmission: React.FC<Props> = ({ submission }: Props) => {
  return (
    <Link href={`/my-submissions/${submission.id}`} key={submission.id} className="w-full">
      {submission.id}
      <br />
    </Link>
  );
};

export default ComboSubmission;
