import styles from "./comboList.module.scss";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import React, { useEffect, useState } from "react";
import PlaceholderText from "../../layout/PlaceholderText/PlaceholderText";
import { addPeriod } from "../../../lib/addPeriod";
import { Template } from "@spacecowmedia/spellbook-client";

type Props = {
  title: string;
  cardsInCombo?: string[];
  templatesInCombo?: Template[];
  includeCardLinks?: boolean;
  showNumbers?: boolean;
  iterations: string[];
  id?: string;
  className?: string;
  appendPeriod?: boolean;
};

const ComboList: React.FC<Props> = ({
  title,
  cardsInCombo = [],
  templatesInCombo = [],
  includeCardLinks,
  showNumbers,
  iterations,
  id,
  className,
  appendPeriod,
}) => {
  const [numberOfPlaceHolderItems, setNumberOfPlaceHolderItems] = useState(0);

  useEffect(() => {
    setNumberOfPlaceHolderItems(Math.floor(Math.random() * 5) + 2);
  }, []);

  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className={styles.comboListTitle}>{title}</h2>
        <ol className={`${styles.comboList} ${showNumbers && "list-decimal"}`}>
          {iterations.map((item, index) => (
            <li key={`${title}-${index}`}>
              <TextWithMagicSymbol
                text={appendPeriod ? addPeriod(item) : item}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
                templatesInCombo={templatesInCombo}
              />
            </li>
          ))}
          {iterations.length === 0 &&
            Array.from(Array(numberOfPlaceHolderItems).keys()).map((index) => (
              <li key={index}>
                <PlaceholderText maxLength={50} />
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default ComboList;
