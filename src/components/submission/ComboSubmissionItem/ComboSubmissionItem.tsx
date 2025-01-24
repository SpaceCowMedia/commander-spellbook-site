import { VariantSuggestion, VariantSuggestionStatusEnum } from '@spacecowmedia/spellbook-client';
import styles from './ComboSubmissionItem.module.scss';
import Link from 'next/link';
import React from 'react';
import Icon from 'components/layout/Icon/Icon';

type Props = {
  submission: VariantSuggestion;
};

const ComboSubmissionItem: React.FC<Props> = ({ submission }: Props) => {
  const submissionIngredients = submission.uses
    .map((u) => u.card)
    .concat(submission.requires.map((r) => r.template))
    .join(' + ');
  const submissionResults = submission.produces.map((p) => p.feature).join(' + ');
  const statusAsText =
    submission.status == VariantSuggestionStatusEnum.A
      ? 'Accepted'
      : submission.status == VariantSuggestionStatusEnum.N
        ? 'New'
        : submission.status == VariantSuggestionStatusEnum.Ad
          ? 'Awaiting Discussion'
          : submission.status == VariantSuggestionStatusEnum.R
            ? 'Rejected'
            : submission.status == VariantSuggestionStatusEnum.Pa
              ? 'Pending Approval'
              : 'Unknown';
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('delete');
  };
  let result = (
    <div className={styles.itemContainer}>
      <div className={styles.info}>
        <h2 className={styles.title}>Combo Suggestion #{submission.id}</h2>
        <div className={styles.ingredients}>Cards: {submissionIngredients}</div>
        <div className={styles.results}>Results: {submissionResults}</div>
      </div>
      <div className={styles.icons}>
        <div className={styles.status} title={statusAsText}>
          {submission.status == VariantSuggestionStatusEnum.A ? (
            <Icon name="checkDouble" />
          ) : submission.status == VariantSuggestionStatusEnum.Pa ? (
            <Icon name="check" />
          ) : submission.status == VariantSuggestionStatusEnum.R ? (
            <Icon name="cross" />
          ) : submission.status == VariantSuggestionStatusEnum.N ? (
            <Icon name="pencil" />
          ) : submission.status == VariantSuggestionStatusEnum.Ad ? (
            <Icon name="comments" />
          ) : (
            <Icon name="question" />
          )}
        </div>
        {submission.status == VariantSuggestionStatusEnum.N && (
          <div className={styles.action} title="Delete this submission" onClick={handleDelete}>
            <Icon name="trash" />
          </div>
        )}
      </div>
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
