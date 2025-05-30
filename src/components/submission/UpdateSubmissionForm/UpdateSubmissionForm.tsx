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
  VariantInVariantUpdateSuggestion,
  VariantUpdateSuggestion,
  VariantUpdateSuggestionRequest,
  VariantUpdateSuggestionsApi,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import VariantIdSubmission from '../VariantIdSubmission/VariantIdSubmission';
import { useDebounce } from 'use-debounce';

type Props = {
  submission?: VariantUpdateSuggestion;
  comboId?: string;
};

const UpdateSubmissionForm: React.FC<Props> = ({ submission, comboId }) => {
  const router = useRouter();
  const [variants, setVariants] = useState<VariantInVariantUpdateSuggestion[]>(
    (submission?.variants ?? []).concat(comboId ? [{ variant: comboId, issue: '' }] : []),
  );
  const [kind, setKind] = useState<KindEnum>(submission?.kind ?? KindEnum.Nw);
  const [comment, setComment] = useState(submission?.comment ?? '');
  const [issue, setIssue] = useState(submission?.issue ?? '');
  const [solution, setSolution] = useState(submission?.solution ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorObj, setErrorObj] = useState<ComboSubmissionErrorType>();
  const [suggestionRequest, setSuggestionRequest] = useDebounce<VariantUpdateSuggestionRequest | undefined>(
    undefined,
    2000,
  );

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

  const configuration = apiConfiguration();
  const updateSuggestionsApi = new VariantUpdateSuggestionsApi(configuration);

  useEffect(() => {
    if (!suggestionRequest) {
      return;
    }
    let validationRequest: Promise<VariantUpdateSuggestion>;
    if (submission) {
      validationRequest = updateSuggestionsApi.variantUpdateSuggestionsValidateUpdate({
        id: submission.id,
        variantUpdateSuggestionRequest: suggestionRequest,
      });
    } else {
      validationRequest = updateSuggestionsApi.variantUpdateSuggestionsValidateCreate({
        variantUpdateSuggestionRequest: suggestionRequest,
      });
    }
    validationRequest
      .then(() => {
        setErrorObj(undefined);
      })
      .catch((err) => {
        const error = err as ResponseError;
        error.response.json().then(setErrorObj);
      });
  }, [suggestionRequest]);

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

  const handleVariantChange = (variant: VariantInVariantUpdateSuggestion, index: number) => {
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
    } catch (err) {
      setSuccess(false);
      setSubmitting(false);
      const error = err as ResponseError;
      const errorJson = await error.response.json();
      setErrorObj(errorJson);
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
      <p className="heading-subtitle mb-6">
        Before {submission && 're-'}submitting an update, please read through our{' '}
        <ExternalLink href="https://discord.com/channels/673601282946236417/1267907655683280952">FAQs</ExternalLink>
      </p>

      {errorObj?.detail && <ErrorMessage>{errorObj.detail}</ErrorMessage>}
      {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors} />}

      <h2 className="heading-subtitle flex justify-start">Update Kind</h2>
      <ErrorMessage list={errorObj?.kind} />
      <div className="flex flex-col">
        <select
          className="select w-full p-4 border-gray-300 border"
          value={kind}
          onChange={(e) => setKind(e.target.value as KindEnum)}
        >
          <option value={KindEnum.Nw}>Combo{variants.length != 1 ? 's' : ''} Not Working</option>
          <option value={KindEnum.Ii}>Incorrect Information</option>
          <option value={KindEnum.Se}>Spelling/Grammar Error</option>
          <option value={KindEnum.Wc}>Wrong Card</option>
          <option value={KindEnum.Vg}>Variant Grouping</option>
          <option value={KindEnum.O}>Other</option>
        </select>
      </div>

      <h2 className="heading-subtitle flex justify-start mt-6">List of the combos displaying the issue(s)</h2>
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
      <button className="button" onClick={handleAddVariant}>
        Add Combo
      </button>

      <h2 className="heading-subtitle flex justify-start">Describe the problem</h2>
      <ErrorMessage list={errorObj?.issue} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="e.g. The combo doesn't work because..."
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
      />

      <h2 className="heading-subtitle flex justify-start">Propose a possible solution (optional)</h2>
      <ErrorMessage list={errorObj?.solution} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="e.g. You can fix the combo by..."
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
      />

      <h2 className="heading-subtitle flex justify-start">Comments (optional)</h2>
      <ErrorMessage list={errorObj?.comment} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="Notes useful for editors that review your submission"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1024}
      />

      <div className="flex justify-center">
        <button disabled={submitting} className="button" onClick={handleSubmit}>
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
