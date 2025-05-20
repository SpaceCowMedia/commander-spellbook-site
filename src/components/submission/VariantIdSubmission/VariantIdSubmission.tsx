import { useState } from 'react';
import { VariantInVariantUpdateSuggestion } from '@space-cow-media/spellbook-client';

type Props = {
  variant: VariantInVariantUpdateSuggestion;
  onChange: (_variant: VariantInVariantUpdateSuggestion) => void;
  onDelete: () => void;
  index: number;
};
const VariantIdSubmission = ({ variant, onChange, index, onDelete }: Props) => {
  const [variantIdInput, setVariantIdInput] = useState(variant?.variant || '');
  const [issueInput, setIssueInput] = useState(variant?.issue || '');

  const handleIdInputChange = (value: string) => {
    try {
      const url = new URL(value);
      if (url.protocol == window.location.protocol && url.hostname === window.location.hostname) {
        // If the URL is a valid one, we can extract the ID from it
        // and use it as the variant ID
        value = url.pathname.split('/')[2];
      }
    } catch (_e) {
      // If the URL is invalid, we can just use the input as is
      // and let the API handle it
      // as a string
    }
    setVariantIdInput(value);
    onChange({ ...variant, variant: value });
  };

  const handleIssueInputChange = (value: string) => {
    setIssueInput(value);
    onChange({ ...variant, issue: value });
  };

  return (
    <div className="border border-gray-250 rounded  flex-col p-5 shadow-lg mb-5 relative">
      <label className="font-bold">Combo:</label>
      <input
        id={`variant-id-${index}`}
        type="text"
        value={variantIdInput}
        onChange={(e) => handleIdInputChange(e.target.value)}
        placeholder="Variant ID"
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
      <button
        className="w-6 h-6 rounded-full flex justify-center text-white bg-red-900 font-bold absolute -right-2 -top-2 hover:scale-125 transform transition-all duration-200 ease-in-out"
        onClick={onDelete}
        title="Remove card from combo"
      >
        x
      </button>
      <label className="font-bold">Variant specific issue:</label>
      <input
        id={`variant-issue-${index}`}
        type="text"
        value={issueInput}
        onChange={(e) => handleIssueInputChange(e.target.value)}
        placeholder="Describe the issue"
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
    </div>
  );
};

export default VariantIdSubmission;
