import AutocompleteInput from '../../advancedSearch/AutocompleteInput/AutocompleteInput';
import { useEffect, useState } from 'react';
import Select, { MultiValue } from 'react-select';
import {
  Card,
  CardsApi,
  CardUsedInVariantSuggestionRequest,
  FeatureStatusEnum,
  TemplateInVariant,
  TemplateRequiredInVariantSuggestionRequest,
  TemplatesApi,
  ZoneLocationsEnum,
} from '@space-cow-media/spellbook-client';
import scryfall from 'scryfall-client';
import { getScryfallImage, scryfallQueryReplacements } from '../../../services/scryfall.service';
import { useDebounce } from 'use-debounce';
import TemplateCard from '../../combo/TemplateCard/TemplateCard';
import ErrorMessage, { unhandledErrors } from '../ErrorMessage/ErrorMessage';
import CardImage from '../../layout/CardImage/CardImage';
import Icon from '../../layout/Icon/Icon';
import { ComboSubmissionErrorType } from '../../../lib/types';
import normalizeQuotes from '../../../lib/normalizeQuotes';
import ScryfallQueryHelp from '../ScryfallQueryHelp/ScryfallQueryHelp';
import Alert from '../../layout/Alert/Alert';
import { apiConfiguration } from 'services/api.service';

const CARD_GROUPS_SEARCH_LIMIT = 20;

const ZONE_OPTIONS = [
  { value: 'H', label: 'Hand' },
  { value: 'B', label: 'Battlefield' },
  { value: 'G', label: 'Graveyard' },
  { value: 'L', label: 'Library' },
  { value: 'E', label: 'Exile' },
  { value: 'C', label: 'Command Zone' },
];

function buildPreviewCard(name: string, frontImage: string, backImage?: string): Card {
  return {
    id: 0,
    name,
    oracleId: null,
    spoiler: false,
    faces: backImage ? 2 : 1,
    typeLine: '',
    layoutRotationFront: null,
    imageUriFrontSmall: null,
    imageUriFrontNormal: frontImage,
    imageUriFrontLarge: null,
    imageUriFrontPng: null,
    imageUriFrontArtCrop: null,
    imageUriBackSmall: null,
    imageUriBackNormal: backImage ?? null,
    imageUriBackLarge: null,
    imageUriBackPng: null,
    imageUriBackArtCrop: null,
  };
}

// Card names of multi faced cards are stored as "Front Face // Back Face", while users usually type the front face only
function frontFaceName(name: string) {
  return name.split('//')[0].trim().toLowerCase();
}

function isSubmittedTemplate(name: string, submittedTemplateNames?: string[]) {
  return !!submittedTemplateNames?.some((submitted) => submitted.trim().toLowerCase() === name.trim().toLowerCase());
}

const ZONE_STATE_FIELDS: Record<string, string> = {
  [ZoneLocationsEnum.B]: 'battlefieldCardState',
  [ZoneLocationsEnum.E]: 'exileCardState',
  [ZoneLocationsEnum.G]: 'graveyardCardState',
  [ZoneLocationsEnum.L]: 'libraryCardState',
};

// Both public features and templates are generic cards a specific card can be replaced with
export interface CardGroup {
  key: string;
  name: string;
}

interface Props {
  card?: CardUsedInVariantSuggestionRequest;
  template?: TemplateRequiredInVariantSuggestionRequest;
  onChange: (_card: CardUsedInVariantSuggestionRequest | TemplateRequiredInVariantSuggestionRequest) => void;
  onDelete: () => void;
  index: number;
  errors?: ComboSubmissionErrorType;
  onReplaceWithTemplate?: (_cardGroup: CardGroup) => void;
  submittedTemplateNames?: string[];
}
const CardSubmission = ({
  card,
  template,
  onChange,
  index,
  onDelete,
  errors,
  onReplaceWithTemplate,
  submittedTemplateNames,
}: Props) => {
  if (card && template) {
    throw new Error('CardSubmission cannot have both a card and a template');
  }
  const cardOrTemplate = card || template;
  if (!cardOrTemplate) {
    throw new Error('CardSubmission must have either a card or a template');
  }

  const [nameInput, setNameInput] = useState(card?.card || '');
  const [debouncedName] = useDebounce(nameInput, 500);
  const [cardGroups, setCardGroups] = useState<{ cardName: string; groups: CardGroup[] } | undefined>(undefined);
  const [templateInput, setTemplateInput] = useState(template?.template || '');
  const [previewCard, setPreviewCard] = useState<Card | undefined>(undefined);
  const [selectedCardName, setSelectedCardName] = useState(card?.card || '');

  const scryfallQuery = (cardOrTemplate as TemplateRequiredInVariantSuggestionRequest).scryfallQuery || '';
  const [debouncedQuery] = useDebounce(scryfallQuery, 500);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryValid, setQueryValid] = useState(false);

  const templateForPreview: TemplateInVariant | undefined = template && {
    template: {
      id: 0,
      name: template.template || '',
      scryfallQuery: debouncedQuery.trim() || null,
      scryfallApi: null,
    },
    zoneLocations: template.zoneLocations,
    battlefieldCardState: template.battlefieldCardState || '',
    exileCardState: template.exileCardState || '',
    libraryCardState: template.libraryCardState || '',
    graveyardCardState: template.graveyardCardState || '',
    mustBeCommander: template.mustBeCommander || false,
    quantity: template.quantity || 1,
  };

  useEffect(() => {
    if (!card) {
      return;
    }
    const name = selectedCardName.trim();
    if (!name) {
      setPreviewCard(undefined);
      return;
    }
    let cancelled = false;
    scryfall
      .getCardNamed(name, { kind: 'exact' })
      .then((fetchedCard) => {
        if (cancelled) {
          return;
        }
        const [front, back] = getScryfallImage(fetchedCard);
        setPreviewCard(front ? buildPreviewCard(name, front, back) : undefined);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewCard(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCardName, card]);

  useEffect(() => {
    if (!card || !onReplaceWithTemplate) {
      return;
    }
    const name = debouncedName.trim();
    if (!name) {
      setCardGroups(undefined);
      return;
    }
    let cancelled = false;
    const configuration = apiConfiguration();
    const cardsApi = new CardsApi(configuration);
    const templatesApi = new TemplatesApi(configuration);

    const lookupCardGroups = async () => {
      const cardsPage = await cardsApi.cardsList({ q: frontFaceName(name), limit: CARD_GROUPS_SEARCH_LIMIT });
      const matchingCard = cardsPage.results.find((result) => frontFaceName(result.name) === frontFaceName(name));
      if (!matchingCard) {
        return undefined;
      }
      const templatesPage = await templatesApi
        .templatesList({ replacements: [matchingCard.id], limit: CARD_GROUPS_SEARCH_LIMIT })
        .catch(() => undefined);
      const groups = matchingCard.features
        .filter((feature) => feature.feature.status === FeatureStatusEnum.Pu)
        .map<CardGroup>((feature) => ({
          key: `feature-${feature.id}`,
          name: feature.feature.name,
        }))
        .concat(
          (templatesPage?.results ?? []).map<CardGroup>((matchingTemplate) => ({
            key: `template-${matchingTemplate.id}`,
            name: matchingTemplate.name,
          })),
        );
      return {
        cardName: matchingCard.name,
        groups: groups.filter(
          (group, position, all) =>
            all.findIndex((other) => other.name.toLowerCase() === group.name.toLowerCase()) === position,
        ),
      };
    };

    lookupCardGroups()
      .then((result) => {
        if (!cancelled) {
          setCardGroups(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCardGroups(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedName, card]);

  useEffect(() => {
    if (!template) {
      return;
    }
    const query = debouncedQuery.trim();
    if (!query) {
      setQueryError(null);
      setQueryValid(false);
      return;
    }
    let cancelled = false;
    scryfallQueryReplacements(query, 0)
      .then((page) => {
        if (cancelled) {
          return;
        }
        if ((page.count ?? page.results.length) > 0) {
          setQueryValid(true);
          setQueryError(null);
        } else {
          setQueryValid(false);
          setQueryError('This Scryfall query does not match any card.');
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setQueryValid(false);
        setQueryError(error?.details || error?.message || 'Invalid Scryfall query.');
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, template]);

  const otherErrors = unhandledErrors(errors, [
    'card',
    'template',
    'scryfallQuery',
    'zoneLocations',
    'quantity',
    'mustBeCommander',
    ...cardOrTemplate.zoneLocations.map((zone) => ZONE_STATE_FIELDS[zone]).filter(Boolean),
  ]);

  const handleZoneChange = (zoneLocations: MultiValue<{ value: string; label: string }>) => {
    const newZoneList = zoneLocations.map((zone) => ZoneLocationsEnum[zone.value as keyof typeof ZoneLocationsEnum]);
    onChange({
      ...cardOrTemplate,
      zoneLocations: newZoneList,
      exileCardState: newZoneList.includes(ZoneLocationsEnum.E) ? cardOrTemplate.exileCardState : '',
      graveyardCardState: newZoneList.includes(ZoneLocationsEnum.G) ? cardOrTemplate.graveyardCardState : '',
      libraryCardState: newZoneList.includes(ZoneLocationsEnum.L) ? cardOrTemplate.libraryCardState : '',
      battlefieldCardState: newZoneList.includes(ZoneLocationsEnum.B) ? cardOrTemplate.battlefieldCardState : '',
    });
  };

  const handleTemplateInputChange = (value: string) => {
    setTemplateInput(value);
    onChange({ ...cardOrTemplate, template: value });
  };

  const handleCardInputChange = (value: string) => {
    setNameInput(value);
    onChange({ ...cardOrTemplate, card: value });
    if (value !== selectedCardName) {
      setSelectedCardName('');
    }
  };

  const handleCardSelect = (value: string) => {
    setSelectedCardName(value);
  };

  return (
    <div className="submission-panel space-y-3">
      <ErrorMessage list={otherErrors} />
      {template && (
        <>
          <div className="field-group">
            <label className="field-label">Template Name</label>
            <ErrorMessage list={errors?.template} />
            <AutocompleteInput
              value={templateInput}
              onChange={handleTemplateInputChange}
              label="Template Name"
              inputClassName="border-dark"
              templateAutocomplete={true}
              inputId={index.toString()}
              placeholder="Search for a template (ex: 'Creature with haste') or type in a new one..."
              // hasError={!!input.error}
              useValueForInput
              maxLength={256}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Scryfall query (optional)</label>
            <ErrorMessage list={errors?.scryfallQuery} />
            <input
              className="field-input"
              value={scryfallQuery}
              onChange={(e) => onChange({ ...cardOrTemplate, scryfallQuery: normalizeQuotes(e.target.value) })}
              placeholder="(ex: t:creature)"
            />
            <ScryfallQueryHelp />
          </div>
          {scryfallQuery.trim() && queryError && <ErrorMessage>{queryError}</ErrorMessage>}
          {scryfallQuery.trim() && queryValid && !queryError && templateForPreview && (
            <div className="flex justify-center pt-2">
              <div className="w-64 max-w-full">
                <TemplateCard
                  key={debouncedQuery.trim()}
                  template={templateForPreview}
                  fetchTemplateReplacements={(_t, page) => scryfallQueryReplacements(debouncedQuery.trim(), page)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {card && (
        <>
          <div className="field-group">
            <label className="field-label">Card Name</label>
            <ErrorMessage list={errors?.card} />
            <AutocompleteInput
              value={nameInput}
              onChange={handleCardInputChange}
              onSelect={handleCardSelect}
              label="Card Name"
              inputClassName="border-dark"
              cardAutocomplete={true}
              inputId={index.toString()}
              placeholder="Search for a card..."
              // hasError={!!input.error}
              useValueForInput
              maxLength={256}
            />
          </div>
          {previewCard && (
            <div className="flex justify-center pt-2">
              <div className="w-64 max-w-full">
                <CardImage card={previewCard} />
              </div>
            </div>
          )}
          {onReplaceWithTemplate && cardGroups && cardGroups.groups.length > 0 && (
            <Alert type="info" icon="template" title="This card is part of a generic card replacement list">
              <p>
                {cardGroups.cardName} is part of{' '}
                {cardGroups.groups.length > 1
                  ? 'these generic card replacement lists'
                  : 'a generic card replacement list'}
                . If your combo works with any card of the list, submitting the list instead of the specific card makes
                the combo cover all of them. Do you want to submit this combo with{' '}
                {cardGroups.groups.length > 1 ? 'one of these' : 'it'} instead?
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {cardGroups.groups.map((cardGroup) => {
                  const alreadySubmitted = isSubmittedTemplate(cardGroup.name, submittedTemplateNames);
                  return (
                    <button
                      key={cardGroup.key}
                      className="flex items-center gap-2 rounded-lg border border-primary/50 px-3 py-1 text-sm font-bold text-link transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent dark:text-primary dark:disabled:border-gray-600 dark:disabled:text-gray-500"
                      onClick={() => onReplaceWithTemplate(cardGroup)}
                      disabled={alreadySubmitted}
                      title={
                        alreadySubmitted
                          ? 'This generic card is already part of this combo'
                          : 'Replace this card with the generic card replacement list'
                      }
                    >
                      <Icon name={alreadySubmitted ? 'check' : 'template'} /> {cardGroup.name}
                    </button>
                  );
                })}
              </div>
            </Alert>
          )}
        </>
      )}

      <button className="submission-remove" onClick={onDelete} title="Remove card from combo">
        <Icon name="cross" />
      </button>
      <div className="field-group">
        <label className="field-label">Zone(s)</label>
        <ErrorMessage list={errors?.zoneLocations} />
        <Select
          placeholder="Select one or more zones that the card must be in..."
          isMulti
          options={ZONE_OPTIONS}
          onChange={handleZoneChange}
          value={cardOrTemplate.zoneLocations.map(
            (zone) =>
              ZONE_OPTIONS.find((z) => z.value === zone) || {
                value: 'N/A',
                label: 'N/A',
              },
          )}
          className="inputControl"
          styles={{
            control: (base) => ({
              ...base,
              background: 'inherit',
            }),
            menu: (base) => ({
              ...base,
              background: 'inherit',
            }),
            option: (base, state) => ({
              ...base,
              background: state.isFocused ? '#888888' : 'inherit',
              color: 'inherit',
            }),
          }}
        />
      </div>

      {cardOrTemplate.zoneLocations.includes(ZoneLocationsEnum.E) && (
        <div className="field-group">
          <label className="field-label">Exile State (optional)</label>
          <ErrorMessage list={errors?.exileCardState} />
          <input
            className="field-input"
            value={cardOrTemplate.exileCardState}
            onChange={(e) => onChange({ ...cardOrTemplate, exileCardState: normalizeQuotes(e.target.value) })}
            placeholder="Exile state (ex: Exiled by...)"
          />
        </div>
      )}

      {cardOrTemplate.zoneLocations.includes(ZoneLocationsEnum.G) && (
        <div className="field-group">
          <label className="field-label">Graveyard State (optional)</label>
          <ErrorMessage list={errors?.graveyardCardState} />
          <input
            className="field-input"
            value={cardOrTemplate.graveyardCardState}
            onChange={(e) =>
              onChange({
                ...cardOrTemplate,
                graveyardCardState: normalizeQuotes(e.target.value),
              })
            }
            placeholder="Graveyard state (ex: Entered the graveyard this turn)"
          />
        </div>
      )}

      {cardOrTemplate.zoneLocations.includes(ZoneLocationsEnum.L) && (
        <div className="field-group">
          <label className="field-label">Library State (optional)</label>
          <ErrorMessage list={errors?.libraryCardState} />
          <input
            className="field-input"
            value={cardOrTemplate.libraryCardState}
            onChange={(e) => onChange({ ...cardOrTemplate, libraryCardState: normalizeQuotes(e.target.value) })}
            placeholder="Library state (ex: On the top of your library)"
          />
        </div>
      )}

      {cardOrTemplate.zoneLocations.includes(ZoneLocationsEnum.B) && (
        <div className="field-group">
          <label className="field-label">Battlefield State (optional)</label>
          <ErrorMessage list={errors?.battlefieldCardState} />
          <input
            className="field-input"
            value={cardOrTemplate.battlefieldCardState}
            onChange={(e) =>
              onChange({
                ...cardOrTemplate,
                battlefieldCardState: normalizeQuotes(e.target.value),
              })
            }
            placeholder="Battlefield state (ex: Untapped)"
          />
        </div>
      )}

      <ErrorMessage list={errors?.quantity} />
      <ErrorMessage list={errors?.mustBeCommander} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <label
            className="cursor-pointer select-none font-bold"
            htmlFor={`quantity-input-${template ? 't' : 'c'}-${index}`}
          >
            Quantity
          </label>
          <input
            className="w-16 cursor-pointer rounded-lg border border-gray-300 px-2 py-1 text-center dark:border-gray-600"
            type="number"
            value={cardOrTemplate.quantity ?? 1}
            id={`quantity-input-${template ? 't' : 'c'}-${index}`}
            min="1"
            max="10"
            onChange={(e) => onChange({ ...cardOrTemplate, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>

        <label
          className="flex cursor-pointer select-none items-center gap-2 font-bold"
          htmlFor={`commander-checkbox-${template ? 't' : 'c'}-${index}`}
        >
          <input
            className="h-4 w-4 cursor-pointer accent-primary"
            id={`commander-checkbox-${template ? 't' : 'c'}-${index}`}
            checked={cardOrTemplate.mustBeCommander}
            onChange={() =>
              onChange({
                ...cardOrTemplate,
                mustBeCommander: !cardOrTemplate.mustBeCommander,
              })
            }
            type="checkbox"
          />
          Must be commander?
        </label>
      </div>
    </div>
  );
};

export default CardSubmission;
