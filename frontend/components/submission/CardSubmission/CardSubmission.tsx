import {SubmissionCardType, TemplateSubmissionType} from "../../../types/submission";
import AutocompleteInput from "../../advancedSearch/AutocompleteInput/AutocompleteInput";
import {useEffect, useState} from "react";
import Select, {MultiValue} from 'react-select'
import TemplateService from "../../../services/template.service";
import cardAutocompleteOptionsUnmapped from "assets/autocomplete-data/cards.json";

const ZONE_OPTIONS = [
  {value: 'H', label: 'Hand'},
  {value: 'B', label: 'Battlefield'},
  {value: 'G', label: 'Graveyard'},
  {value: 'L', label: 'Library'},
  {value: 'E', label: 'Exile'},
  {value: 'C', label: 'Command Zone'},
]


type Props = {
  card: SubmissionCardType | TemplateSubmissionType
  onChange: (card: SubmissionCardType | TemplateSubmissionType) => void
  onDelete: () => void
  index: number
  template?: boolean
}

const cardAutocompleteOptions = cardAutocompleteOptionsUnmapped.map((card: any) => ({value: card.label, label: card.label}))

const CardSubmission = ({card, onChange, index, onDelete, template}: Props) => {

  const [nameInput, setNameInput] = useState(card.card || '')
  const [templateInput, setTemplateInput] = useState(card.template || '')
  const [templateOptions, setTemplateOptions] = useState<Array<{value: string, label: string}>>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)

  const handleZoneChange = (zoneLocations: MultiValue<{value: string, label: string}>) => {
    const newZoneList = zoneLocations.map(zone => zone.value)
    onChange({
      ...card,
      zoneLocations: newZoneList,
      exileCardState: newZoneList.includes('E') ? card.exileCardState : '',
      graveyardCardState: newZoneList.includes('G') ? card.graveyardCardState : '',
      libraryCardState: newZoneList.includes('L') ? card.libraryCardState : '',
      battlefieldCardState: newZoneList.includes('B') ? card.battlefieldCardState : '',
    })
  }

  const handleTemplateInputChange = (value: string) => {
    setTemplateInput(value)
    onChange({...card as TemplateSubmissionType, template: value})

    if (value.length < 3) return setTemplateOptions([])

    setTemplatesLoading(true)
    TemplateService.getTemplates(value)
      .then(response => {
        setTemplateOptions(response.results.map(template => ({value: template.template, label: template.template})))
        setTemplatesLoading(false)
      }).catch(e => console.error(e))

  }

  const handleCardInputChange = (value: string) => {
    setNameInput(value)
    onChange({...card as SubmissionCardType, card: value})
  }

  return (
    <div className="border border-gray-250 rounded  flex-col p-5 shadow-lg mb-5 relative">

      {template && (
        <>
          <label className="font-bold">Template Name:</label>
          <AutocompleteInput
            value={templateInput}
            onChange={handleTemplateInputChange}
            label='Template Name'
            inputClassName="border-dark"
            autocompleteOptions={templateOptions}
            inputId={index.toString()}
            placeholder="Search for a template (ex: 'Creature with haste')..."
            loading={templatesLoading}
            // hasError={!!input.error}
            useValueForInput
            matchAgainstOptionLabel
            maxLength={256}
          />
        </>
      )}

      {!template && (
        <>
          <label className="font-bold">Card Name:</label>
          <AutocompleteInput
            value={nameInput}
            onChange={handleCardInputChange}
            label='Card Name'
            inputClassName="border-dark"
            autocompleteOptions={cardAutocompleteOptions}
            inputId={index.toString()}
            placeholder="Search for a card..."
            // hasError={!!input.error}
            useValueForInput
            matchAgainstOptionLabel
            maxLength={256}
          />
        </>
      )}

      <button
        className="w-6 h-6 rounded-full flex justify-center text-white bg-red-900 font-bold absolute -right-2 -top-2 hover:scale-125 transform transition-all duration-200 ease-in-out"
        onClick={onDelete}
        title="Remove card from combo"
      >
        x
      </button>
      <div>
        <label className="font-bold">Zone(s):</label>
        <Select
          placeholder="Select one or more zones that the card must be in..."
          isMulti
          options={ZONE_OPTIONS}
          onChange={handleZoneChange}
          value={card.zoneLocations.map(zone => ZONE_OPTIONS.find(z => z.value === zone) || {value: 'N/A', label: 'N/A'})}
        />
      </div>

      {card.zoneLocations.includes('E') && (
        <div>
          <label className="font-bold">Exile State (optional):</label>
          <input
            className="border border-gray-250 rounded p-1"
            value={card.exileCardState}
            onChange={(e) => onChange({...card, exileCardState: e.target.value})}
            placeholder="Exile state (ex: Exiled by...)"
          />
        </div>
      )}

      {card.zoneLocations.includes('G') && (
        <div>
          <label className="font-bold">Graveyard State (optional):</label>
          <input
            className="border border-gray-250 rounded p-1"
            value={card.graveyardCardState}
            onChange={(e) => onChange({...card, graveyardCardState: e.target.value})}
            placeholder="Graveyard state (ex: Entered the graveyard this turn)"
          />
        </div>
      )}

      {card.zoneLocations.includes('L') && (
        <div>
          <label className="font-bold">Library State (optional):</label>
          <input
            className="border border-gray-250 rounded p-1"
            value={card.libraryCardState}
            onChange={(e) => onChange({...card, libraryCardState: e.target.value})}
            placeholder="Library state (ex: On the top of your library)"
          />
        </div>
      )}

      {card.zoneLocations.includes('B') && (
        <div>
          <label className="font-bold">Battlefield State (optional):</label>
          <input
            className="border border-gray-250 rounded p-1"
            value={card.battlefieldCardState}
            onChange={(e) => onChange({...card, battlefieldCardState: e.target.value})}
            placeholder="Battlefield state (ex: Untapped)"
          />
        </div>
      )}

      <div className="mt-8">
        <input
          className="mr-2 cursor-pointer"
          id={`commander-checkbox-${index}`}
          value={card.card}
          onChange={() => onChange({...card, mustBeCommander: !card.mustBeCommander})}
          type="checkbox"
        />
        <label className="cursor-pointer select-none" htmlFor={`commander-checkbox-${index}`}>Must be commander?</label>
      </div>
    </div>
  )
}

export default CardSubmission
