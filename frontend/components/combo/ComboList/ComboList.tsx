import styles from "./comboList.module.scss";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import React, { useEffect, useState } from "react";
import PlaceholderText from "../../layout/PlaceholderText/PlaceholderText";

type Props = {
  title: string;
  cardsInCombo?: string[];
  includeCardLinks?: boolean;
  showNumbers?: boolean;
  iterations: string[];
  id?: string;
  className?: string;
};

const ComboList = ({
  title,
  cardsInCombo = [],
  includeCardLinks,
  showNumbers,
  iterations,
  id,
  className,
}: Props) => {
  const [numberOfPlaceHolderItems, setNumberOfPlaceHolderItems] = useState(0);

  useEffect(() => {
    setNumberOfPlaceHolderItems(Math.floor(Math.random() * 5) + 2);
  }, []);

  return (
    <div
      id={id}
      className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}
    >
      <div className="pr-6 py-4">
        <h2 className={styles.comboListTitle}>{title}</h2>
        <ol className={`${styles.comboList} ${showNumbers && "list-decimal"}`}>
          {iterations.map((item, index) => (
            <li key={`${title}-${index}`}>
              <TextWithMagicSymbol
                text={item}
                cardsInCombo={cardsInCombo}
                includeCardLinks={includeCardLinks}
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
