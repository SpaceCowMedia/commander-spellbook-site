import React from "react";
import {ComboSubmissionErrorType} from "../../../lib/types";

type Props = {
  list?: (ComboSubmissionErrorType | string)[]
  children?: React.ReactNode
}

function camelCaseToWords(s: string) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
const getErrorMessageList = (agg: string[], input: (ComboSubmissionErrorType | string)[], label?: string) => {
  for (const item of input) {
    if (typeof item === "string") {
      agg.push(label ? `${label} - ${item}` : item)
    } else {
      for (const key in item) {
        getErrorMessageList(agg, item[key], camelCaseToWords(key))
      }
    }
  }
}
const ErrorMessage = ({list, children}: Props) => {

  if ((!list || list.length === 0) && !children) return null

  const stringList: string[] = []
  getErrorMessageList(stringList, list || [])

  return (
    <div className="p-2 bg-red-100 border border-red-400 rounded text-red-900 my-2">
      {list &&
      <ul className="list-disc list-inside" >
        {stringList.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>}
      {children}
    </div>
  )

}

export default ErrorMessage
