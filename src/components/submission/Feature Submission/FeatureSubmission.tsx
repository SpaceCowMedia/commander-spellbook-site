import React, { useState } from 'react';
import AutocompleteInput from '../../advancedSearch/AutocompleteInput/AutocompleteInput';
import Icon from '../../layout/Icon/Icon';
import { FeatureProducedInVariantSuggestionRequest } from '@space-cow-media/spellbook-client';

interface Props {
  feature: FeatureProducedInVariantSuggestionRequest;
  onChange: (_feature: FeatureProducedInVariantSuggestionRequest) => void;
  onDelete: () => void;
  index: number;
}

const FeatureSubmission: React.FC<Props> = ({ feature, onChange, onDelete, index }) => {
  const [featureInput, setFeatureInput] = useState(feature.feature);

  const handleFeatureInputChange = (value: string) => {
    setFeatureInput(value);
    onChange({ feature: value });
  };

  return (
    <div className="submission-panel">
      <label className="field-label">Feature Name</label>
      <AutocompleteInput
        value={featureInput}
        onChange={handleFeatureInputChange}
        label="Template Name"
        inputClassName="border-dark"
        resultAutocomplete={true}
        inputId={index.toString()}
        placeholder="Search for a feature (ex: 'Infinite mana')..."
        // hasError={!!input.error}
        useValueForInput
        maxLength={256}
      />
      <button className="submission-remove" onClick={onDelete} title="Remove feature from combo">
        <Icon name="cross" />
      </button>
    </div>
  );
};

export default FeatureSubmission;
