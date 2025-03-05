import { ComboPrerequisites } from '../../../lib/types';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';
import { addPeriod } from '../../../lib/addPeriod';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import React from 'react';
import { ScryfallResultsPage } from 'services/scryfall.service';

type Props = {
  prerequisites: ComboPrerequisites[];
  className?: string;
  id?: string;
  includeCardLinks?: boolean;
  cardsInCombo?: CardInVariant[];
  templatesInCombo?: TemplateInVariant[];
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
};

const ICON_MAP: Record<string, SpellbookIcon> = {
  B: 'battlefield',
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
  fetchTemplateReplacements,
}) => {
  const zonePrerequisites = prerequisites.filter((prereq) => prereq.zones.filter((z) => ICON_MAP[z]).length > 0);
  const easyPrerequisites = prerequisites.find((prereq) => prereq.zones.find((z) => z == 'easy'));
  const notablePrerequisites = prerequisites.find((prereq) => prereq.zones.find((z) => z == 'notable'));
  const manaNeeded = prerequisites.find((prereq) => prereq.zones.find((z) => z == 'mana'));
  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className="font-bold text-xl mb-2">Initial Card State</h2>
        <ol className="list-inside">
          {zonePrerequisites.map((prereq, index) => (
            <li key={`${prereq.zones.join('')}-${index}`}>
              {prereq.zones
                .filter((z) => ICON_MAP[z])
                .map((z) => (
                  <span key={`${prereq.zones.join('')}-${index}-${z}`}>
                    <Icon name={ICON_MAP[z]} />
                    &nbsp;
                  </span>
                ))}
              <TextWithMagicSymbol
                text={addPeriod(prereq.description)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
                fetchTemplateReplacements={fetchTemplateReplacements}
              />
            </li>
          ))}
        </ol>
      </div>
      {easyPrerequisites && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Easy Prerequisites</h2>
          <ol className="list-inside">
            <li>
              <TextWithMagicSymbol
                text={addPeriod(easyPrerequisites.description)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
                fetchTemplateReplacements={fetchTemplateReplacements}
              />
            </li>
          </ol>
        </div>
      )}
      {notablePrerequisites && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Notable Prerequisites</h2>
          <ol className="list-inside">
            <li>
              <TextWithMagicSymbol
                text={addPeriod(notablePrerequisites.description)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
                fetchTemplateReplacements={fetchTemplateReplacements}
              />
            </li>
          </ol>
        </div>
      )}
      {manaNeeded && (
        <div className="pr-6 py-4">
          <h2 className="font-bold text-xl mb-2">Mana Needed</h2>
          <ol className="list-inside">
            <li>
              <TextWithMagicSymbol
                text={addPeriod(manaNeeded.description)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
                fetchTemplateReplacements={fetchTemplateReplacements}
              />
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default PrerequisiteList;
