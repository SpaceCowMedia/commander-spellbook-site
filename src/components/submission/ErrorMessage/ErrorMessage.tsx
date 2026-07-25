import React from 'react';
import { ComboSubmissionErrorType } from '../../../lib/types';

interface Props {
  list?: (ComboSubmissionErrorType | string)[];
  children?: React.ReactNode;
}

function camelCaseToWords(s: string) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
const getErrorMessageList = (agg: string[], input: (ComboSubmissionErrorType | string)[], label?: string) => {
  for (const item of input) {
    if (typeof item === 'string') {
      agg.push(label ? `${label} - ${item}` : item);
    } else {
      for (const key in item) {
        getErrorMessageList(agg, item[key], camelCaseToWords(key));
      }
    }
  }
};

// Errors of a list field are returned as one entry per item, plus plain strings for the list itself
export function listLevelErrors(list?: (ComboSubmissionErrorType | string)[]): string[] | undefined {
  const strings = list?.filter((item): item is string => typeof item === 'string');
  return strings && strings.length > 0 ? strings : undefined;
}

export function itemErrors(
  list: (ComboSubmissionErrorType | string)[] | undefined,
  index: number,
): ComboSubmissionErrorType | undefined {
  const item = list?.[index];
  if (!item || typeof item === 'string' || Object.keys(item).length === 0) {
    return undefined;
  }
  return item;
}

// Errors of an item that are not displayed next to a specific field of that item
export function unhandledErrors(
  errors: ComboSubmissionErrorType | undefined,
  handledFields: string[],
): (ComboSubmissionErrorType | string)[] | undefined {
  if (!errors) {
    return undefined;
  }
  const result: (ComboSubmissionErrorType | string)[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (handledFields.includes(key) || !Array.isArray(value)) {
      continue;
    }
    if (key === 'nonFieldErrors') {
      result.push(...value);
    } else {
      result.push({ [key]: value } as ComboSubmissionErrorType);
    }
  }
  return result.length > 0 ? result : undefined;
}

const ErrorMessage: React.FC<Props> = ({ list, children }) => {
  if ((!list || list.length === 0) && !children) {
    return null;
  }

  const stringList: string[] = [];
  getErrorMessageList(stringList, list || []);

  return (
    <div className="p-2 bg-red-100 border border-red-400 rounded-sm text-red-900 my-2">
      {list && (
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
