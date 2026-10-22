import { addTransitionType, startTransition, useState } from 'react';
import { REGROUP } from './viewTransitions';
import { VariantGrouping } from './variantGroups';

// The cards of the variants move from the old grouping to the new one.
export default function useVariantGrouping(initialGrouping: VariantGrouping, transitionType = REGROUP) {
  const [grouping, setGrouping] = useState(initialGrouping);
  const regroup = (newGrouping: VariantGrouping) =>
    startTransition(() => {
      addTransitionType(transitionType);
      setGrouping(newGrouping);
    });
  return [grouping, regroup] as const;
}
