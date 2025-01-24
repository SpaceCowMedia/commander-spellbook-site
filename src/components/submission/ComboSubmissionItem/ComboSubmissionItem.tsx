import { VariantSuggestion, VariantSuggestionsApi, VariantSuggestionStatusEnum } from '@spacecowmedia/spellbook-client';
import styles from './ComboSubmissionItem.module.scss';
import Link from 'next/link';
import React, { useState } from 'react';
import Icon from 'components/layout/Icon/Icon';
import Modal from 'components/ui/Modal/Modal';
import { apiConfiguration } from 'services/api.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';

type Props = {
  submission: VariantSuggestion;
};

const ComboSubmissionItem: React.FC<Props> = ({ submission }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  if (deleted) {
    return false;
  }
  const configuration = apiConfiguration();
  const suggestionsApi = new VariantSuggestionsApi(configuration);

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
    setModalOpen(false);
    suggestionsApi
      .variantSuggestionsDestroy({
        id: submission.id,
      })
      .then(() => {
        setDeleted(true);
      })
      .catch((error) => {
        console.error(error);
        alert('An error occurred while deleting the submission.');
      });
  };

  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  let result = (
    <div className={styles.itemContainer}>
      <div className={styles.info}>
        <h2 className={styles.title}>#{submission.id}</h2>
        <div className={styles.ingredients}>
          <h3 className={styles.subtitle}>Cards</h3>
          <TextWithMagicSymbol text={submissionIngredients} />
        </div>
        <div className={styles.results}>
          <h3 className={styles.subtitle}>Results</h3>
          <TextWithMagicSymbol text={submissionResults} />
        </div>
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
            <Link href={`/my-submissions/${submission.id}`} key={submission.id}>
              <Icon name="pencil" />
            </Link>
          ) : submission.status == VariantSuggestionStatusEnum.Ad ? (
            <Icon name="comments" />
          ) : (
            <Icon name="question" />
          )}
        </div>
        {submission.status == VariantSuggestionStatusEnum.N && (
          <>
            <button className={styles.action} title="Delete this submission" onClick={handleModalOpen}>
              <Icon name="trash" />
            </button>
            <Modal
              onClose={() => setModalOpen(false)}
              open={modalOpen}
              footer={
                <>
                  <button onClick={() => setModalOpen(false)} className="button">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="button">
                    Delete
                  </button>
                </>
              }
            >
              <h2 className="text-xl">Are you sure you want to delete this submission?</h2>
              <p>
                Submission #{submission.id}
                <br />
                {submissionIngredients}
                <br />
                <br />
                This action cannot be undone.
              </p>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
  return <li className={styles.item}>{result}</li>;
};

export default ComboSubmissionItem;
