import { ComboPrerequisites } from '../../../lib/types';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';
import { addPeriod } from '../../../lib/addPeriod';
import { CardInVariant, Template, TemplateInVariant } from '@spacecowmedia/spellbook-client';
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
  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className="font-bold text-xl mb-2">Prerequisites</h2>
        <ol className="list-inside">
          {prerequisites.map((prereq, index) => (
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
    </div>
  );
};

export default PrerequisiteList;
