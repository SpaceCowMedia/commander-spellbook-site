import styles from './comboList.module.scss';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import React, { useEffect, useState } from 'react';
import PlaceholderText from '../../layout/PlaceholderText/PlaceholderText';
import { addPeriod } from '../../../lib/addPeriod';
import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from '../../layout/Icon/Icon';

/* An entry that says what it is: the card list marks each name as a card or as a template. */
export interface ComboListItem {
  text: string;
  icon?: SpellbookIcon;
}

interface Props {
  title: string;
  cardsInCombo?: CardInVariant[];
  templatesInCombo?: TemplateInVariant[];
  includeCardLinks?: boolean;
  showNumbers?: boolean;
  iterations: (string | ComboListItem)[];
  id?: string;
  className?: string;
  appendPeriod?: boolean;
  /* Shown when there is nothing to list. Without it an empty list is treated as still loading
     and renders the shimmering placeholders instead. */
  emptyText?: string;
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
  emptyText,
}) => {
  const items = iterations
    .map((item) => (typeof item === 'string' ? { text: item } : item))
    .filter((item) => item.text.trim() !== '');
  const [numberOfPlaceHolderItems, setNumberOfPlaceHolderItems] = useState(0);

  useEffect(() => {
    setNumberOfPlaceHolderItems(Math.floor(Math.random() * 5) + 2);
  }, []);

  return (
    <div id={id} className={`md:flex-1 my-4 w-full rounded-sm overflow-hidden ${className}`}>
      <div className="pr-6 py-4">
        <h2 className={styles.comboListTitle}>{title}</h2>
        {items.length === 0 && emptyText ? (
          <p className={styles.comboListEmpty}>{emptyText}</p>
        ) : (
          <ol className={`${styles.comboList} ${showNumbers && 'list-decimal'}`}>
            {items.map((item, index) => (
              <li key={`${title}-${index}`} className={item.icon ? styles.iconItem : undefined}>
                {item.icon && <Icon name={item.icon} className={styles.itemIcon} />}
                <TextWithMagicSymbol
                  text={appendPeriod ? addPeriod(item.text) : item.text}
                  cardsInCombo={cardsInCombo}
                  includeCardLinks={includeCardLinks}
                  templatesInCombo={templatesInCombo}
                />
              </li>
            ))}
            {items.length === 0 &&
              Array.from(Array(numberOfPlaceHolderItems).keys()).map((index) => (
                <li key={index}>
                  <PlaceholderText maxLength={50} />
                </li>
              ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ComboList;
