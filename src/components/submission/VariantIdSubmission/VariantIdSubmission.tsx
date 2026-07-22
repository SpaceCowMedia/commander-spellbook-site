import { useEffect, useState } from 'react';
import Icon from '../../layout/Icon/Icon';
import ComboResult from '../../search/ComboResult/ComboResult';
import { Variant, VariantInVariantUpdateSuggestionRequest, VariantsApi } from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { useDebounce } from 'use-debounce';

interface Props {
  variant: VariantInVariantUpdateSuggestionRequest;
  onChange: (_variant: VariantInVariantUpdateSuggestionRequest) => void;
  onDelete: () => void;
  index: number;
}

const VariantIdSubmission = ({ variant, onChange, index, onDelete }: Props) => {
  const [variantIdInput, setVariantIdInput] = useState(variant?.variant || '');
  const [issueInput, setIssueInput] = useState(variant?.issue || '');
  const [previewCombo, setPreviewCombo] = useState<Variant | undefined>(undefined);
  const [debouncedId] = useDebounce(variantIdInput, 500);

  useEffect(() => {
    const id = debouncedId.trim();
    if (!id) {
      setPreviewCombo(undefined);
      return;
    }
    let cancelled = false;
    const variantsApi = new VariantsApi(apiConfiguration());
    variantsApi
      .variantsRetrieve({ id })
      .then((result) => {
        if (!cancelled) {
          setPreviewCombo(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewCombo(undefined);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedId]);

  const handleIdInputChange = (value: string) => {
    try {
      const url = new URL(value);
      if (url.protocol == window.location.protocol && url.hostname === window.location.hostname) {
        // If the URL is a valid one, we can extract the ID from it
        // and use it as the variant ID
        value = url.pathname.split('/')[2];
      }
    } catch {
      // If the URL is invalid, we can just use the input as is
      // and let the API handle it
      // as a string
    }
    setVariantIdInput(value.trim());
    onChange({ ...variant, variant: value });
  };

  const handleIssueInputChange = (value: string) => {
    setIssueInput(value);
    onChange({ ...variant, issue: value });
  };

  return (
    <div className="submission-panel space-y-3">
      <div className="field-group">
        <label className="field-label">Combo</label>
        <input
          id={`variant-id-${index}`}
          type="text"
          value={variantIdInput}
          onChange={(e) => handleIdInputChange(e.target.value)}
          placeholder="Variant ID"
          className="field-input"
        />
        {previewCombo && (
          <div className="flex justify-center pt-3">
            <ComboResult combo={previewCombo} hideVariants newTab />
          </div>
        )}
      </div>
      <button className="submission-remove" onClick={onDelete} title="Remove combo from submission">
        <Icon name="cross" />
      </button>
      <div className="field-group">
        <label className="field-label">Variant specific issue</label>
        <input
          id={`variant-issue-${index}`}
          type="text"
          value={issueInput}
          onChange={(e) => handleIssueInputChange(e.target.value)}
          placeholder="Describe the issue"
          className="field-input"
        />
      </div>
    </div>
  );
};

export default VariantIdSubmission;
