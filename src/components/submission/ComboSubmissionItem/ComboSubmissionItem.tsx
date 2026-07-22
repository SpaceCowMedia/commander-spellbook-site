import { VariantSuggestion, VariantSuggestionsApi, SuggestionStatusEnum } from '@space-cow-media/spellbook-client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Icon from 'components/layout/Icon/Icon';
import Modal from 'components/ui/Modal/Modal';
import { apiConfiguration } from 'services/api.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import StatusBadge from 'components/submission/StatusBadge/StatusBadge';

interface Props {
  submission: VariantSuggestion;
}

const ComboSubmissionItem: React.FC<Props> = ({ submission: initialSubmission }) => {
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
  const suggestionsApi = new VariantSuggestionsApi(configuration);

  const submissionIngredients = submission.uses
    .map((u) => u.card)
    .concat(submission.requires.map((r) => r.template))
    .join(' + ');
  const submissionResults = submission.produces.map((p) => p.feature).join(' + ');

  const refreshSubmission = async () => {
    const updatedSubmission = await suggestionsApi.variantSuggestionsRetrieve({
      id: submission.id,
    });
    setSubmission(updatedSubmission);
  };

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

  return (
    <li className="submission-card">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="submission-card-title">Combo Submission #{submission.id}</h2>
          <StatusBadge status={submission.status} />
        </div>
        <div>
          <div className="submission-field-label">Cards</div>
          <TextWithMagicSymbol text={submissionIngredients} />
        </div>
        <div>
          <div className="submission-field-label">Results</div>
          <TextWithMagicSymbol text={submissionResults} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Created {createdAt}</div>
      </div>
      {submission.status == SuggestionStatusEnum.N && (
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/my-submissions/${submission.id}`}
            className="icon-button border-2 border-primary text-link hover:bg-primary hover:text-white dark:text-primary"
            title="Edit this submission"
          >
            <Icon name="pencil" />
          </Link>
          <button className="icon-button bg-danger text-white" title="Delete this submission" onClick={handleModalOpen}>
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
        </div>
      )}
    </li>
  );
};

export default ComboSubmissionItem;
