import React, { useEffect, useState } from 'react';
import ArtCircle from '../../layout/ArtCircle/ArtCircle';
import CardSubmission from '../CardSubmission/CardSubmission';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { useRouter } from 'next/router';
import FeatureSubmission from '../Feature Submission/FeatureSubmission';
import Loader from '../../layout/Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { ComboSubmissionErrorType } from '../../../lib/types';
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
  VariantSuggestion,
  VariantSuggestionRequest,
  VariantSuggestionsApi,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { useDebounce } from 'use-debounce';

type Props = {
  submission?: VariantSuggestion;
};

const CombSubmissionForm: React.FC<Props> = ({ submission }) => {
  const router = useRouter();
  const [cards, setCards] = useState<CardUsedInVariantSuggestionRequest[]>(submission?.uses ?? []);
  const [templates, setTemplates] = useState<TemplateRequiredInVariantSuggestionRequest[]>(submission?.requires ?? []);
  const [features, setFeatures] = useState<FeatureProducedInVariantSuggestionRequest[]>(submission?.produces ?? []);
  const [steps, setSteps] = useState<string[]>(submission?.description.split('\n') ?? []);
  const [easyPrerequisites, setEasyPrerequisites] = useState(submission?.easyPrerequisites ?? '');
  const [notablePrerequisites, setNotablePrerequisites] = useState(submission?.notablePrerequisites ?? '');
  const [comment, setComment] = useState(submission?.comment ?? '');
  const [spoiler, setSpoiler] = useState(submission?.spoiler ?? false);
  const [manaCost, setManaCost] = useState(submission?.manaNeeded ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorObj, setErrorObj] = useState<ComboSubmissionErrorType>();
  const [suggestionRequest, setSuggestionRequest] = useDebounce<VariantSuggestionRequest | undefined>(undefined, 2000);

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

  const configuration = apiConfiguration();
  const variantSuggestionsApi = new VariantSuggestionsApi(configuration);
  const findMyCombosApi = new FindMyCombosApi(configuration);

  useEffect(() => {
    if (!suggestionRequest) {
      return;
    }
    let validationRequest: Promise<VariantSuggestion>;
    if (submission) {
      validationRequest = variantSuggestionsApi.variantSuggestionsValidateUpdate({
        id: submission.id,
        variantSuggestionRequest: suggestionRequest,
      });
    } else {
      validationRequest = variantSuggestionsApi.variantSuggestionsValidateCreate({
        variantSuggestionRequest: suggestionRequest,
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
      uses: cards,
      requires: templates,
      produces: features,
      description: steps.join('\n'),
      easyPrerequisites,
      notablePrerequisites,
      manaNeeded: manaCost,
      comment,
      spoiler,
    });
  }, [cards, templates, features, steps, easyPrerequisites, notablePrerequisites, manaCost, comment, spoiler]);

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
      if (submission) {
        await variantSuggestionsApi.variantSuggestionsUpdate({
          id: submission.id,
          variantSuggestionRequest: {
            uses: cards,
            requires: templates,
            produces: features,
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
    } catch (err) {
      setSuccess(false);
      setSubmitting(false);
      const error = err as ResponseError;
      const errorJson = await error.response.json();
      setErrorObj(errorJson);
    }
  };

  function cardSubmissionToCardInDeck(card: CardUsedInVariantSuggestionRequest): CardInDeckRequest {
    return {
      card: card.card,
      quantity: card.quantity,
    };
  }

  const handleSubmit = async () => {
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
      const error = err as ResponseError;
      const errorBody = await error.response.text();
      const errorJson = JSON.parse(errorBody);
      const cardErrors = Object.keys(errorJson.main).map(parseInt);
      cardErrors.sort((a, b) => a - b);
      errorJson.uses = cardErrors.map((index) => errorJson.main[index.toString()]);
      setErrorObj(errorJson);
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
      <h1 className="heading-title">{submission ? 'Update Combo Submission' : 'Submit a Combo'}</h1>
      <p className="heading-subtitle mb-20">
        Before {submission && 're-'}submitting a combo, please read through our{' '}
        <ExternalLink href="https://discord.com/channels/673601282946236417/1267907655683280952">FAQs</ExternalLink>
      </p>

      {errorObj?.detail && <ErrorMessage>{errorObj.detail}</ErrorMessage>}
      {errorObj?.nonFieldErrors && <ErrorMessage list={errorObj.nonFieldErrors} />}

      <h2 className="heading-subtitle flex justify-start">Specific cards used in this combo ({cards.length})</h2>
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
      <button className="button" onClick={handleAddCard}>
        Add Card
      </button>

      <h2 className="heading-subtitle flex justify-start">Generic cards this combo requires ({templates.length})</h2>
      <ErrorMessage list={errorObj?.requires} />
      <div className="flex flex-col">
        {templates.map((card, index) => (
          <CardSubmission
            template={card}
            onDelete={() => handleDeleteTemplate(index)}
            onChange={(template) => handleTemplateChange(template as TemplateRequiredInVariantSuggestionRequest, index)}
            index={index}
            key={`${index}-${keyId}`}
          />
        ))}
      </div>
      <button className="button" onClick={handleAddTemplate}>
        Add Template
      </button>

      <h2 className="heading-subtitle flex justify-start">Mana required (optional)</h2>
      <ErrorMessage list={errorObj?.manaNeeded} />
      <div className="flex flex-row gap-1 flex-wrap">
        <input
          className="textarea flex-1 p-4 border-gray-300 border mb-3"
          maxLength={51}
          placeholder="e.g. {2}{U}{U}"
          value={manaCost}
          onChange={(e) => setManaCost(e.target.value)}
        />
        <div className="bg-gray-200 h-14 flex-1 flex items-center p-3 whitespace-nowrap min-w-max dark:bg-gray-800">
          Preview: <TextWithMagicSymbol text={manaCost} />
        </div>
      </div>

      <h2 className="heading-subtitle flex justify-start">Easily achievable prerequisites (optional)</h2>
      <ErrorMessage list={errorObj?.easyPrerequisites} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="e.g. It must be your opponent's turn"
        value={easyPrerequisites}
        onChange={(e) => setEasyPrerequisites(e.target.value)}
      />

      <h2 className="heading-subtitle flex justify-start">Notable prerequisites (optional)</h2>
      <ErrorMessage list={errorObj?.notablePrerequisites} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="e.g. You need a way to make an opponent lose life"
        value={notablePrerequisites}
        onChange={(e) => setNotablePrerequisites(e.target.value)}
      />

      <h2 className="heading-subtitle flex justify-start">Steps to execute combo ({steps.length})</h2>
      <ErrorMessage list={errorObj?.description} />
      {steps.map((step, index) => (
        <div className="flex items-center relative" key={`${index}-${keyId}`}>
          <span className="mr-2">{index + 1}.</span>
          <input
            className="textarea w-full p-4 border-gray-300 border mb-3"
            placeholder="e.g. Cast Splinter Twin on Deceiver Exarch"
            value={step}
            onChange={(e) => setSteps([...steps.slice(0, index), e.target.value, ...steps.slice(index + 1)])}
          />

          <button
            className="w-6 h-6 rounded-full flex justify-center text-white bg-red-900 font-bold absolute -right-2 -top-2 hover:scale-125 transform transition-all duration-200 ease-in-out"
            onClick={() => handleDeleteStep(index)}
            title="Remove step from combo"
          >
            x
          </button>
        </div>
      ))}
      <button className="button" onClick={() => setSteps([...steps, ''])}>
        Add Step
      </button>

      <h2 className="heading-subtitle flex justify-start">Results of this combo ({features.length})</h2>
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
      <button className="button" onClick={handleAddFeature}>
        Add Feature
      </button>

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

      <h2 className="heading-subtitle flex justify-start">Comments (optional)</h2>
      <ErrorMessage list={errorObj?.comment} />
      <textarea
        className="textarea w-full p-4 border-gray-300 border"
        placeholder="Notes useful for editors that review your submission"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1024}
      />

      <div className="flex items-center">
        <input type="checkbox" className="mr-2" checked={spoiler} onChange={() => setSpoiler(!spoiler)} />
        <label>Mark this combo as spoiler</label>
      </div>

      <div className="flex justify-center">
        <button disabled={submitting} className="button" onClick={handleSubmit}>
          {submitting ? <Loader /> : submission ? 'Re-submit Combo' : 'Submit Combo'}
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
