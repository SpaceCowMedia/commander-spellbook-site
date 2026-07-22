import {
  KindEnum,
  SuggestionStatusEnum,
  VariantUpdateSuggestion,
  VariantUpdateSuggestionsApi,
} from '@space-cow-media/spellbook-client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Icon from 'components/layout/Icon/Icon';
import Modal from 'components/ui/Modal/Modal';
import { apiConfiguration } from 'services/api.service';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import StatusBadge from 'components/submission/StatusBadge/StatusBadge';

interface Props {
  submission: VariantUpdateSuggestion;
}

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

  const issuePreview = submission.issue.substring(0, 100) + (submission.issue.length > 128 ? '...' : '');

  return (
    <li className="submission-card">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="submission-card-title">Update Submission #{submission.id}</h2>
          <StatusBadge status={submission.status} />
        </div>
        <div>
          <div className="submission-field-label">Kind</div>
          {kindAsText}
        </div>
        {submission.variants.length > 0 && (
          <div>
            <div className="submission-field-label">Combos</div>
            <p>
              {submission.variants.map((variant, index) => (
                <React.Fragment key={index}>
                  <Link href={`/combo/${variant.variant}`} target="_blank" rel="noopener noreferrer">
                    {variant.variant}
                  </Link>
                  {index < submission.variants.length - 1 && <span>, </span>}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
        <div>
          <div className="submission-field-label">Issue</div>
          <TextWithMagicSymbol text={issuePreview} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Created {createdAt}</div>
      </div>
      {submission.status == SuggestionStatusEnum.N && (
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/my-update-submissions/${submission.id}`}
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
              {issuePreview}
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

export default UpdateSubmissionItem;
