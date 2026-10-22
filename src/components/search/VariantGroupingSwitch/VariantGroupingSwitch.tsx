import styles from './variantGroupingSwitch.module.scss';
import React, { useState, ViewTransition } from 'react';
import { VariantGrouping } from 'lib/variantGroups';
import Icon, { SpellbookIcon } from 'components/layout/Icon/Icon';
import { MODAL_SWITCH } from 'lib/viewTransitions';

interface Props {
  id: string;
  value: VariantGrouping;
  onChange: (grouping: VariantGrouping) => unknown;
  // Only variants the deck misses a card of can be grouped by that card.
  groupings?: VariantGrouping[];
}

const OPTIONS: Record<VariantGrouping, { icon: SpellbookIcon; label: string }> = {
  card: { icon: 'addressBook', label: 'By card' },
  combo: { icon: 'windowRestore', label: 'By combo' },
  ungrouped: { icon: 'windowMaximize', label: 'Ungrouped' },
};

const Option: React.FC<{ grouping: VariantGrouping }> = ({ grouping }) => (
  <>
    <Icon name={OPTIONS[grouping].icon} />
    {OPTIONS[grouping].label}
  </>
);

const VariantGroupingSwitch: React.FC<Props> = ({ id, value, onChange, groupings = ['combo', 'ungrouped'] }) => {
  // Switches at once, however long what it groups takes to follow.
  const [checked, setChecked] = useState(value);
  const [shownValue, setShownValue] = useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    setChecked(value);
  }

  // A modal crossfades as it regroups, so the switch stays out of its snapshot, sliding live over it.
  return (
    <ViewTransition update={MODAL_SWITCH} default="none">
      <div className={styles.variantGrouping}>
        <span id={`${id}-label`}>Variants</span>
        <div id={id} role="radiogroup" aria-labelledby={`${id}-label`} className={styles.switch}>
          {groupings.map((grouping) => (
            <label key={grouping} className={styles.option}>
              <input
                type="radio"
                name={id}
                value={grouping}
                checked={checked === grouping}
                onChange={() => {
                  setChecked(grouping);
                  onChange(grouping);
                }}
                className="sr-only"
              />
              <Option grouping={grouping} />
            </label>
          ))}
          {/* The options again in the thumb's colors, clipped to it, so that they change color right where it passes. */}
          <div className={styles.thumb} aria-hidden="true">
            {groupings.map((grouping) => (
              <span key={grouping} className={styles.option}>
                <Option grouping={grouping} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </ViewTransition>
  );
};

export default VariantGroupingSwitch;
