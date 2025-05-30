import {
  KindEnum,
  SuggestionStatusEnum,
  VariantUpdateSuggestion,
  VariantUpdateSuggestionsApi,
} from '@space-cow-media/spellbook-client';
import styles from './updateSubmissionItem.module.scss';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Icon from 'components/layout/Icon/Icon';
import Modal from 'components/ui/Modal/Modal';
import { apiConfiguration } from 'services/api.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';

type Props = {
  submission: VariantUpdateSuggestion;
};

const UpdateSubmissionItem: React.FC<Props> = ({ submission: initialSubmission }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [submission, setSubmission] = useState(initialSubmission);
  const [createdAt, setCreatedAt] = useState('');
  useEffect(() => {
    setCreatedAt(submission.created.toLocaleString());
  }, [submission]);

  if (deleted) {
    return false;
  }
  const configuration = apiConfiguration();
  const suggestionsApi = new VariantUpdateSuggestionsApi(configuration);
  const combosText = submission.variants.map((v) => v.variant).join(', ');
  const statusAsText =
    submission.status == SuggestionStatusEnum.A
      ? 'Accepted'
      : submission.status == SuggestionStatusEnum.N
        ? 'New'
        : submission.status == SuggestionStatusEnum.Ad
          ? 'Awaiting Discussion'
          : submission.status == SuggestionStatusEnum.R
            ? 'Rejected'
            : submission.status == SuggestionStatusEnum.Pa
              ? 'Pending Approval'
              : 'Unknown';
  const kindAsText =
    submission.kind == KindEnum.Nw
      ? 'Not Working'
      : submission.kind == KindEnum.Ii
        ? 'Incorrect Information'
        : submission.kind == KindEnum.Se
          ? 'Spelling Error'
          : submission.kind == KindEnum.Wc
            ? 'Wrong Card'
            : submission.kind == KindEnum.Vg
              ? 'Variant Grouping'
              : submission.kind == KindEnum.O
                ? 'Other'
                : 'Unknown';

  const refreshSubmission = async () => {
    const updatedSubmission = await suggestionsApi.variantUpdateSuggestionsRetrieve({
      id: submission.id,
    });
    setSubmission(updatedSubmission);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(false);
    suggestionsApi
      .variantUpdateSuggestionsDestroy({
        id: submission.id,
      })
      .then(() => {
        setDeleted(true);
      })
      .catch((error) => {
        console.error(error);
        alert(
          "An error occurred while deleting the submission. It is possible that you don't have the permission to delete it, maybe because an editor already took action on it.",
        );
        refreshSubmission();
      });
  };

  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  let result = (
    <div className={styles.itemContainer}>
      <div className={styles.info}>
        <h2 className={styles.title}>Update Submission #{submission.id}</h2>
        <div className={styles.kind}>
          <h3 className={styles.subtitle}>Kind: {kindAsText}</h3>
        </div>
        {submission.variants.length > 0 && (
          <div className={styles.combos}>
            <h3 className={styles.subtitle}>Combos</h3>
            <p>{combosText}</p>
          </div>
        )}
        <div className={styles.issue}>
          <h3 className={styles.subtitle}>Issue</h3>
          <TextWithMagicSymbol
            text={submission.issue.substring(0, 100) + (submission.issue.length > 128 ? '...' : '')}
          />
        </div>
        <div className={styles.extra}>
          <h3 className={styles.subtitle}>Created: {createdAt}</h3>
        </div>
      </div>
      <div className={styles.icons}>
        <div className={styles.status} title={statusAsText}>
          {submission.status == SuggestionStatusEnum.A ? (
            <Icon name="checkDouble" />
          ) : submission.status == SuggestionStatusEnum.Pa ? (
            <Icon name="check" />
          ) : submission.status == SuggestionStatusEnum.R ? (
            <Icon name="cross" />
          ) : submission.status == SuggestionStatusEnum.N ? (
            <Link href={`/my-update-submissions/${submission.id}`} key={submission.id}>
              <Icon name="pencil" />
            </Link>
          ) : submission.status == SuggestionStatusEnum.Ad ? (
            <Icon name="comments" />
          ) : (
            <Icon name="question" />
          )}
        </div>
        {submission.status == SuggestionStatusEnum.N && (
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
                {submission.issue.substring(0, 100) + (submission.issue.length > 128 ? '...' : '')}
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

export default UpdateSubmissionItem;
