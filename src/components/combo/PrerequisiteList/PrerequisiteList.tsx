import { NewPrerequisiteType } from "../../../lib/types";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import Icon from "../../layout/Icon/Icon";
import { addPeriod } from "../../../lib/addPeriod";
import { Template } from "@spacecowmedia/spellbook-client";
import React from "react";

type Props = {
  prerequisites: NewPrerequisiteType[];
  className?: string;
  id?: string;
  cardsInCombo?: string[];
  includeCardLinks?: boolean;
  templatesInCombo?: Template[];
};

const ICON_MAP = {
  B: "battlefield",
  C: "commandZone",
  G: "graveyard",
  H: "hand",
  L: "library",
  E: "exile",
};
const PrerequisiteList: React.FC<Props> = ({
  prerequisites,
  className,
  id,
  cardsInCombo,
  includeCardLinks,
  templatesInCombo,
}) => {
  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className="font-bold text-xl mb-2">Prerequisites</h2>
        <ol className="list-inside">
          {prerequisites.map((prereq, index) => (
            <li key={`${prereq.z}-${index}`}>
              {ICON_MAP[prereq.z as keyof typeof ICON_MAP] && (
                <>
                  <Icon name={ICON_MAP[prereq.z as keyof typeof ICON_MAP] as any} />
                  &nbsp;
                </>
              )}
              <TextWithMagicSymbol
                text={addPeriod(prereq.s)}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default PrerequisiteList;
