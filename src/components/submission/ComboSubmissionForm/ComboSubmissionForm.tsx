import React, { useEffect, useState } from 'react';
import ArtCircle from '../../layout/ArtCircle/ArtCircle';
import CardSubmission from '../CardSubmission/CardSubmission';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { useRouter } from 'next/router';
import FeatureSubmission from '../Feature Submission/FeatureSubmission';
import Loader from '../../layout/Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { ComboSubmissionErrorType } from '../../../lib/types';
import { httpErrorMessage } from '../../../lib/httpErrors';
import Alert from 'components/layout/Alert/Alert';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Link from 'next/link';
import {
  CardInDeckRequest,
  CardUsedInVariantSuggestionRequest,
  FeatureProducedInVariantSuggestionRequest,
  FindMyCombosApi,
  ResponseError,
  TemplateRequiredInVariantSuggestionRequest,
  Variant,
  VariantSuggestion,
  VariantSuggestionRequest,
  VariantSuggestionsApi,
  VariantsApi,
  ZoneLocationsEnum,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { useDebounce } from 'use-debounce';
import Icon from '../../layout/Icon/Icon';
import SectionHeading from '../SectionHeading/SectionHeading';
import ComboResult from '../../search/ComboResult/ComboResult';

const VALIDATION_INTERVAL_MS = 3000;
const VALIDATION_MAX_RETRIES = 3;

interface Props {
  submission?: VariantSuggestion;
  variant?: Variant;
}

const CombSubmissionForm: React.FC<Props> = ({ submission, variant }) => {
  const backupKey = submission ? `submission-${submission.id}` : variant ? `variant-${variant.id}` : '';
  const router = useRouter();
  const [suggestionRequestBackup, setSuggestionRequestBackup] = useState<
    Record<string, VariantSuggestionRequest> | undefined
  >(undefined);
  const [suggestionRequest, setSuggestionRequest] = useDebounce<VariantSuggestionRequest | undefined>(
    undefined,
    VALIDATION_INTERVAL_MS,
  );
  const [cards, setCards] = useState<CardUsedInVariantSuggestionRequest[]>(
    () =>
      submission?.uses ??
      variant?.uses.map<CardUsedInVariantSuggestionRequest>((c) => ({
        card: c.card.name,
        quantity: c.quantity,
        zoneLocations: c.zoneLocations as ZoneLocationsEnum[],
        battlefieldCardState: c.battlefieldCardState,
        exileCardState: c.exileCardState,
        graveyardCardState: c.graveyardCardState,
        libraryCardState: c.libraryCardState,
        mustBeCommander: c.mustBeCommander,
      })) ??
      [],
  );
  const [templates, setTemplates] = useState<TemplateRequiredInVariantSuggestionRequest[]>(
    () =>
      submission?.requires ??
      variant?.requires.map<TemplateRequiredInVariantSuggestionRequest>((t) => ({
        template: t.template.name,
        scryfallQuery: t.template.scryfallQuery,
        quantity: t.quantity,
        zoneLocations: t.zoneLocations as ZoneLocationsEnum[],
        battlefieldCardState: t.battlefieldCardState,
        exileCardState: t.exileCardState,
        graveyardCardState: t.graveyardCardState,
        libraryCardState: t.libraryCardState,
        mustBeCommander: t.mustBeCommander,
      })) ??
      [],
  );
  const [features, setFeatures] = useState<FeatureProducedInVariantSuggestionRequest[]>(
    () =>
      submission?.produces ??
      variant?.produces.map<FeatureProducedInVariantSuggestionRequest>((f) => ({
        feature: f.feature.name,
      })) ??
      [],
  );
  const [steps, setSteps] = useState<string[]>(
    () => submission?.description.split('\n') ?? variant?.description.split('\n') ?? [],
  );
  const [easyPrerequisites, setEasyPrerequisites] = useState(
    () => submission?.easyPrerequisites ?? variant?.easyPrerequisites ?? '',
  );
  const [notablePrerequisites, setNotablePrerequisites] = useState(
    () => submission?.notablePrerequisites ?? variant?.notablePrerequisites ?? '',
  );
  const [comment, setComment] = useState(() => submission?.comment ?? variant?.notes ?? '');
  const [variantOf, setVariantOf] = useState(() => submission?.variantOf ?? variant?.id);
  const [spoiler, setSpoiler] = useState(() => submission?.spoiler ?? variant?.spoiler ?? false);
  const [manaCost, setManaCost] = useState(() => submission?.manaNeeded ?? variant?.manaNeeded ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorObj, setErrorObj] = useState<ComboSubmissionErrorType>();
  const [variantOfPreview, setVariantOfPreview] = useState<Variant | undefined>(undefined);
  const [debouncedVariantOf] = useDebounce(variantOf, 500);

  useEffect(() => {
    const id = debouncedVariantOf?.trim();
    if (!id) {
      setVariantOfPreview(undefined);
      return;
    }
    let cancelled = false;
    const variantsApi = new VariantsApi(apiConfiguration());
    variantsApi
      .variantsRetrieve({ id })
      .then((result) => {
        if (!cancelled) {
          setVariantOfPreview(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVariantOfPreview(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedVariantOf]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitting) {
        e.preventDefault();
      } else if (
        (cards.length > 0 ||
          templates.length > 0 ||
          features.length > 0 ||
          steps.length > 0 ||
          easyPrerequisites ||
          notablePrerequisites ||
          comment ||
          variantOf ||
          manaCost ||
          spoiler) &&
        !success
      ) {
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
    const backup: Record<string, VariantSuggestionRequest> = JSON.parse(
      localStorage.getItem('suggestionRequestBackup') || '{}',
    );
    setSuggestionRequestBackup(backup);
    if (backup[backupKey]) {
      console.log(suggestionRequestBackup);
      const shouldRestore = window.confirm(
        'We found an unsent combo submission in your browser. Would you like to restore it?',
      );
      console.log(suggestionRequestBackup);
      if (shouldRestore) {
        const backupRequest = backup[backupKey];
        setCards(backupRequest.uses);
        setTemplates(backupRequest.requires);
        setFeatures(backupRequest.produces);
        setSteps(backupRequest.description.split('\n'));
        setEasyPrerequisites(backupRequest.easyPrerequisites || '');
        setNotablePrerequisites(backupRequest.notablePrerequisites || '');
        setComment(backupRequest.comment || '');
        setVariantOf(backupRequest.variantOf ?? undefined);
        setManaCost(backupRequest.manaNeeded || '');
        setSpoiler(backupRequest.spoiler || false);
        setSuggestionRequest(backupRequest);
      } else {
        const { [backupKey]: _, ...rest } = backup;
        setSuggestionRequestBackup(rest);
      }
    }
  }, []);

  const configuration = apiConfiguration();
  const variantSuggestionsApi = new VariantSuggestionsApi(configuration);
  const findMyCombosApi = new FindMyCombosApi(configuration);

  useEffect(() => {
    if (!suggestionRequest) {
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const runValidation = () => {
      attempts += 1;
      const validationRequest = submission?.id
        ? variantSuggestionsApi.variantSuggestionsValidateUpdate({
            id: submission.id,
            variantSuggestionRequest: suggestionRequest,
          })
        : variantSuggestionsApi.variantSuggestionsValidateCreate({
            variantSuggestionRequest: suggestionRequest,
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
    localStorage.setItem('suggestionRequestBackup', JSON.stringify(suggestionRequestBackup));
  }, [suggestionRequestBackup]);

  useEffect(() => {
    if (submitting || success) {
      if (suggestionRequest) {
        setSuggestionRequest(undefined);
      }
      return;
    }
    setSuggestionRequest({
      uses: cards,
      requires: templates,
      produces: features,
      variantOf: variantOf,
      description: steps.join('\n'),
      easyPrerequisites,
      notablePrerequisites,
      manaNeeded: manaCost,
      comment,
      spoiler,
    });
  }, [
    cards,
    templates,
    features,
    steps,
    easyPrerequisites,
    notablePrerequisites,
    manaCost,
    comment,
    variantOf,
    spoiler,
  ]);

  // Makes sure the keys of lists are distinct after an element is deleted
  const [keyId, setKeyId] = useState<number>(0);

  const handleAddCard = () => {
    setCards([
      ...cards,
      {
        card: '',
        quantity: 1,
        zoneLocations: [],
        battlefieldCardState: '',
        exileCardState: '',
        graveyardCardState: '',
        libraryCardState: '',
        mustBeCommander: false,
      },
    ]);
  };

  const handleAddTemplate = () => {
    setTemplates([
      ...templates,
      {
        template: '',
        quantity: 1,
        zoneLocations: [],
        battlefieldCardState: '',
        exileCardState: '',
        graveyardCardState: '',
        libraryCardState: '',
        mustBeCommander: false,
      },
    ]);
  };

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      {
        feature: '',
      },
    ]);
  };

  const handleCardChange = (card: CardUsedInVariantSuggestionRequest, index: number) => {
    setCards([...cards.slice(0, index), card, ...cards.slice(index + 1)]);
  };
  const handleTemplateChange = (template: TemplateRequiredInVariantSuggestionRequest, index: number) => {
    setTemplates([...templates.slice(0, index), template, ...templates.slice(index + 1)]);
  };
  const handleFeatureChange = (feature: FeatureProducedInVariantSuggestionRequest, index: number) => {
    setFeatures([...features.slice(0, index), feature, ...features.slice(index + 1)]);
  };
  const handleDeleteCard = (index: number) => {
    setCards([...cards.slice(0, index), ...cards.slice(index + 1)]);
    setKeyId(keyId + 1);
  };
  const handleDeleteTemplate = (index: number) => {
    setTemplates([...templates.slice(0, index), ...templates.slice(index + 1)]);
    setKeyId(keyId + 1);
  };
  const handleDeleteFeature = (index: number) => {
    setFeatures([...features.slice(0, index), ...features.slice(index + 1)]);
    setKeyId(keyId + 1);
  };

  const handleDeleteStep = (index: number) => {
    setSteps([...steps.slice(0, index), ...steps.slice(index + 1)]);
    setKeyId(keyId + 1);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    setErrorObj(undefined);
    try {
      if (submission?.id) {
        await variantSuggestionsApi.variantSuggestionsUpdate({
          id: submission.id,
          variantSuggestionRequest: {
            uses: cards,
            requires: templates,
            produces: features,
            variantOf: variantOf,
            description: steps.join('\n'),
            easyPrerequisites,
            notablePrerequisites,
            manaNeeded: manaCost,
            comment,
            spoiler,
          },
        });
      } else {
        await variantSuggestionsApi.variantSuggestionsCreate({
          variantSuggestionRequest: {
            uses: cards,
            requires: templates,
            produces: features,
            variantOf: variantOf,
            description: steps.join('\n'),
            easyPrerequisites,
            notablePrerequisites,
            manaNeeded: manaCost,
            comment,
            spoiler,
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
          detail:
            'You are not authorized to submit combos. Please log in and try again. You can login on a different tab and come back to this page.' +
            (suggestionRequestBackup && suggestionRequestBackup[backupKey]
              ? ' Your current progress has been saved, so you can restore it after logging in if this tab gets closed.'
              : ''),
        } as ComboSubmissionErrorType);
      } else {
        setErrorObj({
          statusCode: status,
          detail: httpErrorMessage(status),
        } as ComboSubmissionErrorType);
      }
    }
  };

  function cardSubmissionToCardInDeck(card: CardUsedInVariantSuggestionRequest): CardInDeckRequest {
    return {
      card: card.card,
      quantity: card.quantity,
    };
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await findMyCombosApi.findMyCombosCreate({
        deckRequest: {
          main: cards.map(cardSubmissionToCardInDeck),
        },
      });
      const duplicates = result.results.included;
      if (duplicates.length > 0) {
        confirmAlert({
          message: `This combo appears to include ${duplicates.length} other combo${duplicates.length > 1 ? 's' : ''} already in the database.`,
          childrenElement: function () {
            return (
              <div style={{ marginTop: '1rem', textAlign: 'justify' }}>
                <h3 className="heading-subtitle">{duplicates.length > 6 ? 'Some ' : ''}Included Combos</h3>
                {duplicates.slice(0, 6).map((combo) => (
                  <div className="w-full text-center" key={combo.id}>
                    <Link href={`/combo/${combo.id}`} key={combo.id} rel="noopener noreferrer" target="_blank">
                      {combo.uses
                        .map(({ card, quantity }) => `${quantity > 1 ? `${quantity}x ` : ''}${card.name}`)
                        .concat(
                          combo.requires.map(
                            ({ template, quantity }) => `${quantity > 1 ? `${quantity}x ` : ''}${template.name}`,
                          ),
                        )
                        .join(' + ')}
                    </Link>
                  </div>
                ))}
                <p style={{ marginTop: '1rem' }}>
                  Please, make sure that your combo does not contain "payoff" cards and follows{' '}
                  <ExternalLink href="https://discord.com/channels/673601282946236417/1267907655683280952">
                    our guidelines
                  </ExternalLink>
                  . We only accept combos in their simplest form, and without any unnecessary card.
                </p>
                <p>Would you like to submit it anyway?</p>
              </div>
            );
          },
          buttons: [
            {
              label: 'Yes',
              onClick: confirmSubmit,
            },
            {
              label: 'No',
              onClick: () => {},
            },
          ],
        });
      } else {
        await confirmSubmit();
      }
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
      let errorJson: (ComboSubmissionErrorType & { main?: Record<string, ComboSubmissionErrorType> }) | undefined;
      try {
        errorJson = JSON.parse(await err.response.text());
      } catch {
        errorJson = undefined;
      }
      if (status === 400 && errorJson?.main) {
        const cardErrors = Object.keys(errorJson.main).map(Number);
        cardErrors.sort((a, b) => a - b);
        errorJson.uses = cardErrors.map((index) => errorJson!.main![index.toString()]);
        setErrorObj(errorJson);
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
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Thanks for submitting a suggestion!</h1>
        <div className="flex justify-center">
          <button className="button" onClick={() => router.reload()}>
            Submit another combo
          </button>
          <Link href="/my-submissions">
            <button className="button">View my submissions</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
      <h1 className="heading-title">{submission?.id ? 'Update Combo Submission' : 'Submit a Combo'}</h1>
      <p className="heading-subtitle mb-10">
        Before {submission?.id && 're-'}submitting a combo, please read through our{' '}
        <ExternalLink href="https://discord.com/channels/673601282946236417/1267907655683280952">FAQs</ExternalLink>
      </p>

      {errorObj?.detail && <ErrorMessage>{errorObj.detail}</ErrorMessage>}
      {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors} />}

      <section className="submission-section">
        <SectionHeading icon="listCheck" title="Specific cards used in this combo" count={cards.length} />
        <p className="submission-hint">The exact cards this combo requires to work.</p>
        <ErrorMessage list={errorObj?.uses} />
        <div className="flex flex-col">
          {cards.map((card, index) => (
            <CardSubmission
              card={card}
              onDelete={() => handleDeleteCard(index)}
              onChange={(card) => handleCardChange(card as CardUsedInVariantSuggestionRequest, index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="add-button" onClick={handleAddCard}>
          <Icon name="plus" /> Add Card
        </button>
      </section>

      <section className="submission-section">
        <SectionHeading icon="template" title="Generic cards this combo requires" count={templates.length} />
        <p className="submission-hint">
          Interchangeable pieces described by a template (e.g. “A creature with haste”) or a Scryfall query.
        </p>
        <ErrorMessage list={errorObj?.requires} />
        <div className="flex flex-col">
          {templates.map((card, index) => (
            <CardSubmission
              template={card}
              onDelete={() => handleDeleteTemplate(index)}
              onChange={(template) =>
                handleTemplateChange(template as TemplateRequiredInVariantSuggestionRequest, index)
              }
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="add-button" onClick={handleAddTemplate}>
          <Icon name="plus" /> Add Template
        </button>
      </section>

      <section className="submission-section">
        <SectionHeading icon="coins" title="Mana required (optional)" />
        <ErrorMessage list={errorObj?.manaNeeded} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="field-input flex-1"
            maxLength={51}
            placeholder="e.g. {2}{U}{U}"
            value={manaCost}
            onChange={(e) => setManaCost(e.target.value)}
          />
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
            <TextWithMagicSymbol text={manaCost} />
          </div>
        </div>
      </section>

      <section className="submission-section">
        <SectionHeading icon="check" title="Easily achievable prerequisites (optional)" />
        <ErrorMessage list={errorObj?.easyPrerequisites} />
        <textarea
          className="field-input min-h-24 resize-y"
          placeholder="e.g. It must be your opponent's turn"
          value={easyPrerequisites}
          onChange={(e) => setEasyPrerequisites(e.target.value)}
        />
      </section>

      <section className="submission-section">
        <SectionHeading icon="circleExclamation" title="Notable prerequisites (optional)" />
        <ErrorMessage list={errorObj?.notablePrerequisites} />
        <textarea
          className="field-input min-h-24 resize-y"
          placeholder="e.g. You need a way to make an opponent lose life"
          value={notablePrerequisites}
          onChange={(e) => setNotablePrerequisites(e.target.value)}
        />
      </section>

      <section className="submission-section">
        <SectionHeading icon="listOl" title="Steps to execute combo" count={steps.length} />
        <ErrorMessage list={errorObj?.description} />
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <div className="flex items-center gap-3" key={`${index}-${keyId}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-link text-sm font-bold text-white dark:bg-primary dark:text-dark">
                {index + 1}
              </span>
              <input
                className="field-input"
                placeholder="e.g. Cast Splinter Twin on Deceiver Exarch"
                value={step}
                onChange={(e) => setSteps([...steps.slice(0, index), e.target.value, ...steps.slice(index + 1)])}
              />
              <button
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger text-white transition-transform hover:scale-110"
                onClick={() => handleDeleteStep(index)}
                title="Remove step from combo"
              >
                <Icon name="cross" />
              </button>
            </div>
          ))}
        </div>
        <button className="add-button mt-3" onClick={() => setSteps([...steps, ''])}>
          <Icon name="plus" /> Add Step
        </button>
      </section>

      <section className="submission-section">
        <SectionHeading icon="lightbulb" title="Results of this combo" count={features.length} />
        <p className="submission-hint">What the combo produces (e.g. “Infinite mana”, “Win the game”).</p>
        <ErrorMessage list={errorObj?.produces} />
        <div className="flex flex-col">
          {features.map((feature, index) => (
            <FeatureSubmission
              feature={feature}
              onChange={(f) => handleFeatureChange(f, index)}
              onDelete={() => handleDeleteFeature(index)}
              index={index}
              key={`${index}-${keyId}`}
            />
          ))}
        </div>
        <button className="add-button" onClick={handleAddFeature}>
          <Icon name="plus" /> Add Feature
        </button>
      </section>

      {cards.length > 5 && (
        <Alert type="warning" icon="triangleExclamation" title="Warning">
          This combo might be denied because it is over our five-card maximum. These tips will increase the chances of
          the combo making it onto Commander Spellbook:
          <ul className="list-disc list-inside">
            <li>
              If a card has many replacements in this combo’s color identity, cut it and use the generic card template
              instead. For example, “A Dragon creature” or “A way to give indestructible” can replace a specific card.
            </li>
            <li>
              Cut any cards that are not required to keep the combo going, even if they are needed to win the game. We
              don’t need to list Blood Artist or Impact Tremors on every page.”
            </li>
          </ul>
        </Alert>
      )}

      <section className="submission-section">
        <SectionHeading icon="copy" title="Variant of (optional)" />
        <ErrorMessage list={errorObj?.variantOf} />
        <input
          type="text"
          placeholder='ID of the combo this is a variant of (e.g. "1234-4567")'
          className="field-input"
          value={variantOf || ''}
          onChange={(e) => setVariantOf(e.target.value || undefined)}
          maxLength={128}
        />
        {variantOfPreview && (
          <div className="flex justify-center pt-3">
            <ComboResult combo={variantOfPreview} hideVariants newTab />
          </div>
        )}
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
        <label className="mt-4 flex w-fit cursor-pointer select-none items-center gap-2 font-bold">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-primary"
            checked={spoiler}
            onChange={() => setSpoiler(!spoiler)}
          />
          Mark this combo as spoiler
        </label>
      </section>

      <div className="flex justify-center pt-2">
        <button disabled={submitting} className="submit-button" onClick={handleSubmit}>
          {submitting ? <Loader /> : submission?.id ? 'Re-submit Combo' : 'Submit Combo'}
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

export default CombSubmissionForm;
