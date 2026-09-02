import { ComboPrerequisites } from '../../../lib/types';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';
import { addPeriod } from '../../../lib/addPeriod';
import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';
import React from 'react';

interface Props {
  prerequisites: ComboPrerequisites[];
  className?: string;
  id?: string;
  includeCardLinks?: boolean;
  cardsInCombo?: CardInVariant[];
  templatesInCombo?: TemplateInVariant[];
}

const PREREQ_ICON_MAP: Record<string, SpellbookIcon> = {
  B: 'battlefield',
  commander: 'commander',
  C: 'commandZone',
  G: 'graveyard',
  H: 'hand',
  L: 'library',
  E: 'exile',
};

const PrerequisiteList: React.FC<Props> = ({
  prerequisites,
  className,
  id,
  cardsInCombo,
  includeCardLinks,
  templatesInCombo,
}) => {
  const initialStatePrerequisites = prerequisites.filter(
    (prereq) => prereq.zones.filter((z) => PREREQ_ICON_MAP[z]).length > 0,
  );
  const easyPrerequisites = prerequisites.filter((prereq) => prereq.zones.find((z) => z == 'easy'));
  const notablePrerequisites = prerequisites.filter((prereq) => prereq.zones.find((z) => z == 'notable'));
  const manaNeeded = prerequisites.filter((prereq) => prereq.zones.find((z) => z == 'mana'));
  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded-sm overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className="font-bold text-xl mb-2">Initial Card State</h2>
        <ol className="list-inside">
          {initialStatePrerequisites.map((prereq, index) => (
            <li key={`${prereq.zones.join('')}-${index}`}>
              {prereq.zones
                .filter((z) => PREREQ_ICON_MAP[z])
                .map((z) => (
                  <span key={`${prereq.zones.join('')}-${index}-${z}`}>
                    <Icon name={PREREQ_ICON_MAP[z]} />
                    &nbsp;
                  </span>
                ))}
              <TextWithMagicSymbol
                text={addPeriod(prereq.description)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
              />
            </li>
          ))}
        </ol>
      </div>
      {easyPrerequisites.length > 0 && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Easy Prerequisites</h2>
          <ol className="list-inside">
            {easyPrerequisites.map((prereq, index) => (
              <li key={`${prereq.zones.join('')}-${index}`}>
                <TextWithMagicSymbol
                  text={addPeriod(prereq.description)}
                  cardsInCombo={cardsInCombo}
                  includeCardLinks={includeCardLinks}
                  templatesInCombo={templatesInCombo}
                />
              </li>
            ))}
          </ol>
        </div>
      )}
      {notablePrerequisites.length > 0 && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Notable Prerequisites</h2>
          <ol className="list-inside">
            {notablePrerequisites.map((prereq, index) => (
              <li key={`${prereq.zones.join('')}-${index}`}>
                <TextWithMagicSymbol
                  text={addPeriod(prereq.description)}
                  cardsInCombo={cardsInCombo}
                  includeCardLinks={includeCardLinks}
                  templatesInCombo={templatesInCombo}
                />
              </li>
            ))}
          </ol>
        </div>
      )}
      {manaNeeded.length > 0 && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Mana Needed</h2>
          <ol className="list-inside">
            {manaNeeded.map((manaNeeded, index) => (
              <li key={`${manaNeeded.zones.join('')}-${index}`}>
                <TextWithMagicSymbol
                  text={addPeriod(manaNeeded.description)}
                  cardsInCombo={cardsInCombo}
                  includeCardLinks={includeCardLinks}
                  templatesInCombo={templatesInCombo}
                />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default PrerequisiteList;
