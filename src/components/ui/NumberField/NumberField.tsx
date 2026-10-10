import React, { useId } from 'react';
import Stepper from 'components/ui/Stepper/Stepper';

interface Props {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  orMore?: boolean;
  onChange: (value: number) => void;
  compact?: boolean;
}

/* In a grid, the label, the picker and the hint take three of its rows, so fields side by side keep
   their pickers level whatever the length of their labels and hints. */
const NumberField: React.FC<Props> = ({ label, hint, ...stepper }) => {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="row-span-3 grid min-w-0 grid-rows-subgrid">
      <label htmlFor={id} className="mb-1.5 self-end text-left text-sm font-bold">
        {label}
      </label>
      <Stepper id={id} label={label} describedBy={hint ? hintId : undefined} {...stepper} />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
};

export default NumberField;
