import React, { ViewTransition } from 'react';
import { Variant } from '@space-cow-media/spellbook-client';
import { REGROUP_FADE, REGROUP_GATHER, REGROUP_MOVE, variantTransitionName } from 'lib/viewTransitions';

interface Props {
  // Names the cards of one list's variants, so that each keeps its card as the list groups its variants otherwise.
  scope?: string;
  variant: Variant;
  children: React.ReactElement;
}

// The card of a variant moves to its place in the new grouping, or flies into the card it is grouped into and out of it.
const VariantTransition: React.FC<Props> = ({ scope, variant, children }) =>
  scope ? (
    <ViewTransition
      name={variantTransitionName(scope, variant.id)}
      share={REGROUP_MOVE}
      update={REGROUP_MOVE}
      enter={REGROUP_FADE}
      exit={REGROUP_FADE}
      default="none"
    >
      {children}
    </ViewTransition>
  ) : (
    children
  );

// The variants a card stands for, laid over it for their own cards to fly into and out of.
export const GatheredVariants: React.FC<{ scope: string; variants: Variant[] }> = ({ scope, variants }) =>
  variants.map((variant) => (
    <ViewTransition
      key={variant.id}
      name={variantTransitionName(scope, variant.id)}
      share={REGROUP_GATHER}
      default="none"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
    </ViewTransition>
  ));

export default VariantTransition;
