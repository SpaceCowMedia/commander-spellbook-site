import styles from './comboList.module.scss';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import React, { useEffect, useState } from 'react';
import PlaceholderText from '../../layout/PlaceholderText/PlaceholderText';
import { addPeriod } from '../../../lib/addPeriod';
import { CardInVariant, Template, TemplateInVariant } from '@space-cow-media/spellbook-client';
import { ScryfallResultsPage } from 'services/scryfall.service';

interface Props {
  title: string;
  cardsInCombo?: CardInVariant[];
  templatesInCombo?: TemplateInVariant[];
  includeCardLinks?: boolean;
  showNumbers?: boolean;
  iterations: string[];
  id?: string;
  className?: string;
  appendPeriod?: boolean;
  fetchTemplateReplacements?: (_template: Template, _page: number) => Promise<ScryfallResultsPage>;
}

const ComboList: React.FC<Props> = ({
  title,
  cardsInCombo,
  templatesInCombo,
  includeCardLinks,
  showNumbers,
  iterations,
  id,
  className,
  appendPeriod,
  fetchTemplateReplacements,
}) => {
  iterations = iterations.filter((item) => item.trim() !== '');
  const [numberOfPlaceHolderItems, setNumberOfPlaceHolderItems] = useState(0);

  useEffect(() => {
    setNumberOfPlaceHolderItems(Math.floor(Math.random() * 5) + 2);
  }, []);

  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className={styles.comboListTitle}>{title}</h2>
        <ol className={`${styles.comboList} ${showNumbers && 'list-decimal'}`}>
          {iterations
            .map((item) => (appendPeriod ? addPeriod(item) : item))
            .map((text, index) => (
              <li key={`${title}-${index}`}>
                <TextWithMagicSymbol
                  text={text}
                  cardsInCombo={cardsInCombo}
                  includeCardLinks={includeCardLinks}
                  templatesInCombo={templatesInCombo}
                  fetchTemplateReplacements={fetchTemplateReplacements}
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
