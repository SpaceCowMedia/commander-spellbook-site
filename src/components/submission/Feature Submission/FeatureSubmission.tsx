import React, { useState } from 'react';
import AutocompleteInput from '../../advancedSearch/AutocompleteInput/AutocompleteInput';
import Icon from '../../layout/Icon/Icon';
import { FeatureProducedInVariantSuggestionRequest } from '@space-cow-media/spellbook-client';
import ErrorMessage, { unhandledErrors } from '../ErrorMessage/ErrorMessage';
import { ComboSubmissionErrorType } from '../../../lib/types';

interface Props {
  feature: FeatureProducedInVariantSuggestionRequest;
  onChange: (_feature: FeatureProducedInVariantSuggestionRequest) => void;
  onDelete: () => void;
  index: number;
  errors?: ComboSubmissionErrorType;
}

const FeatureSubmission: React.FC<Props> = ({ feature, onChange, onDelete, index, errors }) => {
  const [featureInput, setFeatureInput] = useState(feature.feature);

  const handleFeatureInputChange = (value: string) => {
    setFeatureInput(value);
    onChange({ feature: value });
  };

  return (
    <div className="submission-panel">
      <ErrorMessage list={unhandledErrors(errors, ['feature'])} />
      <label className="field-label">Feature Name</label>
      <ErrorMessage list={errors?.feature} />
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
