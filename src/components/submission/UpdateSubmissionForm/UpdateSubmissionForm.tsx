import React, { useEffect, useState } from 'react';
import ArtCircle from '../../layout/ArtCircle/ArtCircle';
import { useRouter } from 'next/router';
import Loader from '../../layout/Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { ComboSubmissionErrorType } from '../../../lib/types';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Link from 'next/link';
import {
  KindEnum,
  ResponseError,
  VariantInVariantUpdateSuggestionRequest,
  VariantUpdateSuggestion,
  VariantUpdateSuggestionRequest,
  VariantUpdateSuggestionsApi,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import VariantIdSubmission from '../VariantIdSubmission/VariantIdSubmission';
import { useDebounce } from 'use-debounce';
import Icon from '../../layout/Icon/Icon';
import SectionHeading from '../SectionHeading/SectionHeading';
import { httpErrorMessage } from '../../../lib/httpErrors';

const VALIDATION_INTERVAL_MS = 5000;
const VALIDATION_MAX_RETRIES = 3;

interface Props {
  submission?: VariantUpdateSuggestion;
  comboId?: string;
}

const UpdateSubmissionForm: React.FC<Props> = ({ submission, comboId }) => {
  const backupKey = submission ? `submission-${submission.id}` : comboId ? `combo-${comboId}` : '';
  const router = useRouter();
  const [suggestionRequestBackup, setSuggestionRequestBackup] = useState<
    Record<string, VariantUpdateSuggestionRequest> | undefined
  >(undefined);
  const [suggestionRequest, setSuggestionRequest] = useDebounce<VariantUpdateSuggestionRequest | undefined>(
    undefined,
    VALIDATION_INTERVAL_MS,
  );
  const [variants, setVariants] = useState<VariantInVariantUpdateSuggestionRequest[]>(() =>
    (submission?.variants ?? []).concat(comboId ? [{ variant: comboId, issue: '' }] : []),
  );
  const [kind, setKind] = useState<KindEnum>(() => submission?.kind ?? KindEnum.Nw);
  const [comment, setComment] = useState(() => submission?.comment ?? '');
  const [issue, setIssue] = useState(() => submission?.issue ?? '');
  const [solution, setSolution] = useState(() => submission?.solution ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorObj, setErrorObj] = useState<ComboSubmissionErrorType>();

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitting) {
        e.preventDefault();
      } else if ((issue || solution || comment) && !success) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  });

  useEffect(() => {
    if (suggestionRequestBackup !== undefined) {
      return;
    }
    const backup: Record<string, VariantUpdateSuggestionRequest> = JSON.parse(
      localStorage.getItem('updateSuggestionBackup') || '{}',
    );
    setSuggestionRequestBackup(backup);
    if (backup[backupKey]) {
      const shouldRestore = window.confirm(
        'We found an unsent update suggestion in your browser. Would you like to restore it?',
      );
      if (shouldRestore) {
        const backupRequest = backup[backupKey];
        setVariants(backupRequest.variants ?? []);
        setKind(backupRequest.kind);
        setComment(backupRequest.comment ?? '');
        setIssue(backupRequest.issue);
        setSolution(backupRequest.solution ?? '');
        setSuggestionRequest(backupRequest);
      } else {
        const { [backupKey]: _, ...rest } = backup;
        setSuggestionRequestBackup(rest);
      }
    }
  }, []);

  const configuration = apiConfiguration();
  const updateSuggestionsApi = new VariantUpdateSuggestionsApi(configuration);

  useEffect(() => {
    if (!suggestionRequest) {
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const runValidation = () => {
      attempts += 1;
      const validationRequest = submission
        ? updateSuggestionsApi.variantUpdateSuggestionsValidateUpdate({
            id: submission.id,
            variantUpdateSuggestionRequest: suggestionRequest,
          })
        : updateSuggestionsApi.variantUpdateSuggestionsValidateCreate({
            variantUpdateSuggestionRequest: suggestionRequest,
          });
      validationRequest
        .then(() => {
          if (!cancelled) {
            setErrorObj(undefined);
          }
        })
        .catch((err) => {
          if (cancelled || !(err instanceof ResponseError)) {
            return;
          }
          if (err.response.status === 429) {
            if (attempts < VALIDATION_MAX_RETRIES) {
              retryTimer = setTimeout(runValidation, VALIDATION_INTERVAL_MS);
            } else {
              setErrorObj({
                statusCode: 429,
                detail:
                  'We could not validate your submission because too many requests were made in a short time. Please wait a moment and edit any field to try again.',
              } as ComboSubmissionErrorType);
            }
            return;
          }
          err.response.json().then((errorJson) => {
            if (!cancelled) {
              setErrorObj(errorJson);
            }
          });
        });
    };
    runValidation();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [suggestionRequest]);

  useEffect(() => {
    if (suggestionRequestBackup === undefined) {
      return;
    }
    if (suggestionRequest) {
      setSuggestionRequestBackup({
        ...suggestionRequestBackup,
        [backupKey]: suggestionRequest,
      });
    } else if (suggestionRequestBackup) {
      const { [backupKey]: _, ...rest } = suggestionRequestBackup;
      setSuggestionRequestBackup(rest);
    }
  }, [suggestionRequest]);

  useEffect(() => {
    if (suggestionRequestBackup === undefined) {
      return;
    }
    localStorage.setItem('updateSuggestionBackup', JSON.stringify(suggestionRequestBackup));
  }, [suggestionRequestBackup]);

  useEffect(() => {
    if (submitting || success) {
      if (suggestionRequest) {
        setSuggestionRequest(undefined);
      }
      return;
    }
    setSuggestionRequest({
      kind: kind,
      variants: variants,
      issue: issue,
      solution: solution ?? undefined,
      comment: comment ?? undefined,
    });
  }, [kind, variants, issue, solution, comment]);

  // Makes sure the keys of lists are distinct after an element is deleted
  const [keyId, setKeyId] = useState<number>(0);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variant: '',
        issue: '',
      },
    ]);
  };

  const handleVariantChange = (variant: VariantInVariantUpdateSuggestionRequest, index: number) => {
    setVariants([...variants.slice(0, index), variant, ...variants.slice(index + 1)]);
  };

  const handleDeleteVariant = (index: number) => {
    setVariants([...variants.slice(0, index), ...variants.slice(index + 1)]);
    setKeyId(keyId + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorObj(undefined);
    try {
      if (submission) {
        await updateSuggestionsApi.variantUpdateSuggestionsUpdate({
          id: submission.id,
          variantUpdateSuggestionRequest: {
            kind: kind,
            variants: variants,
            issue: issue,
            solution: solution ?? undefined,
            comment: comment ?? undefined,
          },
        });
      } else {
        await updateSuggestionsApi.variantUpdateSuggestionsCreate({
          variantUpdateSuggestionRequest: {
            kind: kind,
            variants: variants,
            issue: issue,
            solution: solution ?? undefined,
            comment: comment ?? undefined,
          },
        });
      }
      setSubmitting(false);
      setSuccess(true);
      setSuggestionRequest(undefined);
      setSuggestionRequest.flush();
    } catch (err) {
      setSuccess(false);
      setSubmitting(false);
      if (!(err instanceof ResponseError)) {
        setErrorObj({
          detail: 'Could not reach the server. Please check your connection and try again.',
        } as ComboSubmissionErrorType);
        return;
      }
      const status = err.response.status;
      if (status === 400 && err.response.headers.get('Content-Type')?.includes('application/json')) {
        setErrorObj(await err.response.json());
      } else if (status === 401 || status === 403) {
        setErrorObj({
          statusCode: status,
          detail: 'You need to be logged in to submit an update suggestion.',
        } as ComboSubmissionErrorType);
      } else {
        setErrorObj({
          statusCode: status,
          detail: httpErrorMessage(status),
        } as ComboSubmissionErrorType);
      }
    }
  };

  if (success) {
    return (
      <div className="static-page">
        <ArtCircle cardName="Arcane Teachings" className="m-auto md:block hidden" />
        <h1 className="heading-title">Thanks for submitting an update suggestion!</h1>
        <div className="flex justify-center">
          <button className="button" onClick={() => router.reload()}>
            Submit another update
          </button>
          <Link href="/my-update-submissions">
            <button className="button">View my update submissions</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <ArtCircle cardName="Arcane Teachings" className="m-auto md:block hidden" />
      <h1 className="heading-title">{submission ? 'Update Combo Update Submission' : 'Submit an Update'}</h1>
      <p className="heading-subtitle mb-10">
        Before {submission && 're-'}submitting an update, please read through our{' '}
        <ExternalLink href="https://discord.com/channels/673601282946236417/1267907655683280952">FAQs</ExternalLink>
      </p>

      {errorObj?.detail && <ErrorMessage>{errorObj.detail}</ErrorMessage>}
      {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors} />}

      <section className="submission-section">
        <SectionHeading icon="tags" title="Update Kind" />
        <ErrorMessage list={errorObj?.kind} />
        <select className="field-input" value={kind} onChange={(e) => setKind(e.target.value as KindEnum)}>
          <option value={KindEnum.Nw}>Combo{variants.length != 1 ? 's' : ''} Not Working</option>
          <option value={KindEnum.Ii}>Incorrect Information</option>
          <option value={KindEnum.Se}>Spelling/Grammar Error</option>
          <option value={KindEnum.Wc}>Wrong Card</option>
          <option value={KindEnum.Vg}>Variant Grouping</option>
          <option value={KindEnum.Bc}>Bracket Classification</option>
          <option value={KindEnum.O}>Other</option>
        </select>
      </section>

      <section className="submission-section">
        <SectionHeading icon="hashtag" title="Combos displaying the issue(s)" count={variants.length} />
        <ErrorMessage list={errorObj?.variants} />
        <div className="flex flex-col">
          {variants.map((variant, index) => (
            <VariantIdSubmission
              variant={variant}
              onDelete={() => handleDeleteVariant(index)}
              onChange={(variant) => handleVariantChange(variant, index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="add-button" onClick={handleAddVariant}>
          <Icon name="plus" /> Add Combo
        </button>
      </section>

      <section className="submission-section">
        <SectionHeading icon="circleExclamation" title="Describe the problem" />
        <ErrorMessage list={errorObj?.issue} />
        <textarea
          className="field-input min-h-24 resize-y"
          placeholder="e.g. The combo doesn't work because..."
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        />
      </section>

      <section className="submission-section">
        <SectionHeading icon="lightbulb" title="Propose a possible solution (optional)" />
        <ErrorMessage list={errorObj?.solution} />
        <textarea
          className="field-input min-h-24 resize-y"
          placeholder="e.g. You can fix the combo by..."
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
        />
      </section>

      <section className="submission-section">
        <SectionHeading icon="comments" title="Comments (optional)" />
        <ErrorMessage list={errorObj?.comment} />
        <textarea
          className="field-input min-h-24 resize-y"
          placeholder="Notes useful for editors that review your submission"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1024}
        />
      </section>

      <div className="flex justify-center pt-2">
        <button disabled={submitting} className="submit-button" onClick={handleSubmit}>
          {submitting ? <Loader /> : submission ? 'Re-submit Update' : 'Submit Update'}
        </button>
      </div>

      {errorObj?.detail && <ErrorMessage>{errorObj.detail}</ErrorMessage>}
      {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors} />}
      {errorObj && !errorObj.nonFieldErrors && !errorObj.detail && (
        <ErrorMessage>
          There were errors in your submission. Please fix the mistakes outlined above and resubmit.
        </ErrorMessage>
      )}
    </div>
  );
};

export default UpdateSubmissionForm;
