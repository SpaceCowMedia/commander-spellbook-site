import React from 'react';
import { ComboSubmissionErrorType, ErrorDetail } from '../../../lib/types';

interface Props {
  list?: ErrorDetail;
  children?: React.ReactNode;
}

function camelCaseToWords(s: string) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// The errors of a list field are keyed by the index of the item they belong to
function isItemKey(key: string) {
  return /^\d+$/.test(key);
}

function labelFor(key: string) {
  // `nonFieldErrors` holds the errors of the object itself, so it adds nothing to the label
  if (key === 'nonFieldErrors') {
    return undefined;
  }
  return isItemKey(key) ? `#${Number(key) + 1}` : camelCaseToWords(key);
}

const getErrorMessageList = (agg: string[], input?: ErrorDetail, label?: string) => {
  if (input === undefined || input === null) {
    return;
  }
  if (typeof input === 'string') {
    agg.push(label ? `${label} - ${input}` : input);
  } else if (Array.isArray(input)) {
    for (const item of input) {
      getErrorMessageList(agg, item, label);
    }
  } else {
    for (const [key, value] of Object.entries(input)) {
      const nestedLabel = [label, labelFor(key)].filter((part) => !!part).join(' ');
      getErrorMessageList(agg, value, nestedLabel || undefined);
    }
  }
};

// Everything that is not keyed by the index of an item belongs to the list itself
export function listLevelErrors(errors?: ErrorDetail): ErrorDetail | undefined {
  if (!errors || typeof errors === 'string') {
    return errors || undefined;
  }
  if (Array.isArray(errors)) {
    // Before DRF 3.18 the errors of the items were entries of this same list
    const strings = errors.filter((item): item is string => typeof item === 'string');
    return strings.length > 0 ? strings : undefined;
  }
  const listErrors = Object.entries(errors).filter(([key]) => !isItemKey(key));
  return listErrors.length > 0 ? Object.fromEntries(listErrors) : undefined;
}

export function itemErrors(errors: ErrorDetail | undefined, index: number): ComboSubmissionErrorType | undefined {
  if (!errors || typeof errors === 'string') {
    return undefined;
  }
  if (Array.isArray(errors)) {
    // Before DRF 3.18 the items were entries of this same list, with an empty object for the valid
    // ones, while plain messages belonged to the list itself
    const item = errors[index];
    return item && typeof item !== 'string' && !Array.isArray(item) && Object.keys(item).length > 0 ? item : undefined;
  }
  const item = errors[index.toString()];
  if (!item) {
    return undefined;
  }
  if (typeof item === 'string' || Array.isArray(item)) {
    // Errors of an item that are not tied to any of its fields
    return { nonFieldErrors: typeof item === 'string' ? [item] : item };
  }
  return Object.keys(item).length > 0 ? item : undefined;
}

// Errors of an item that are not displayed next to a specific field of that item
export function unhandledErrors(
  errors: ComboSubmissionErrorType | undefined,
  handledFields: string[],
): ErrorDetail | undefined {
  if (!errors) {
    return undefined;
  }
  const unhandled: Record<string, ErrorDetail> = {};
  for (const [key, value] of Object.entries(errors)) {
    // `statusCode` is added by the client and holds no message
    if (handledFields.includes(key) || key === 'statusCode' || value === undefined) {
      continue;
    }
    unhandled[key] = value as ErrorDetail;
  }
  return Object.keys(unhandled).length > 0 ? unhandled : undefined;
}

const ErrorMessage: React.FC<Props> = ({ list, children }) => {
  const stringList: string[] = [];
  getErrorMessageList(stringList, list);

  if (stringList.length === 0 && !children) {
    return null;
  }

  return (
    <div className="p-2 bg-red-100 border border-red-400 rounded-sm text-red-900 my-2">
      {stringList.length > 0 && (
        <ul className="list-disc list-inside">
          {stringList.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
};

export default ErrorMessage;
