import {FeatureSubmissionType} from "../../../types/submission";
import React, {useState} from "react";
import AutocompleteInput from "../../advancedSearch/AutocompleteInput/AutocompleteInput";
import FeatureService from "../../../services/feature.service";

type Props = {
  feature: FeatureSubmissionType
  onChange: (feature: FeatureSubmissionType) => void
  onDelete: () => void
  index: number
}
const FeatureSubmission = ({
  feature,
  onChange,
  onDelete,
  index
}: Props) => {

  const [featureInput, setFeatureInput] = useState(feature.feature)
  const [featureOptions, setFeatureOptions] = useState<Array<{value: string, label: string}>>([])
  const [featuresLoading, setFeaturesLoading] = useState(false)

  const handleFeatureInputChange = (value: string) => {
    setFeatureInput(value)
    onChange({feature: value})

    if (value.length < 3) return setFeatureOptions([])

    setFeaturesLoading(true)
    FeatureService.getFeatures(value)
      .then(response => {
        setFeatureOptions(response.results.map(feature => ({value: feature.name, label: feature.name})))
        setFeaturesLoading(false)
      }).catch(e => console.error(e))

  }

  return (
    <div className="border border-gray-250 rounded  flex-col p-5 shadow-lg mb-5 relative">
      <label className="font-bold">Feature Name:</label>
      <AutocompleteInput
        value={featureInput}
        onChange={handleFeatureInputChange}
        label='Template Name'
        inputClassName="border-dark"
        autocompleteOptions={featureOptions}
        inputId={index.toString()}
        placeholder="Search for a feature (ex: 'Infinite mana')..."
        loading={featuresLoading}
        // hasError={!!input.error}
        useValueForInput
        matchAgainstOptionLabel
        maxLength={256}
      />
      <button
        className="w-6 h-6 rounded-full flex justify-center text-white bg-red-900 font-bold absolute -right-2 -top-2 hover:scale-125 transform transition-all duration-200 ease-in-out"
        onClick={onDelete}
        title="Remove step from combo"
      >
        x
      </button>
    </div>
  )
}

export default FeatureSubmission
