import React from 'react';
import Link from 'next/link';
import { CardDetail, FeatureStatusEnum, Template } from '@space-cow-media/spellbook-client';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { CardResult } from 'lib/cardCombos';
import { cardComboQuery, quotedSearchValue, searchPath, variantSearchPath } from 'lib/cards';
import sections from '../cardSections.module.scss';

interface Props {
  card: CardDetail;
  formatTerm: string;
  results: CardResult[];
  templates: Template[];
}

const Chip: React.FC<{ href?: string; title?: string; children: React.ReactNode }> = ({ href, title, children }) =>
  href ? (
    <Link href={href} className={sections.chip} title={title}>
      {children}
    </Link>
  ) : (
    <span className={sections.chip}>{children}</span>
  );

const CardRoles: React.FC<Props> = ({ card, formatTerm, results, templates }) => {
  const features = [
    ...new Set(
      card.features.filter(({ feature }) => feature.status === FeatureStatusEnum.Pu).map(({ feature }) => feature.name),
    ),
  ];
  const resultSearch = (name: string) => {
    const value = quotedSearchValue(name);
    return value && variantSearchPath(cardComboQuery(card, formatTerm, `result=${value}`));
  };
  const templateSearch = (name: string) => {
    const value = quotedSearchValue(name);
    return value && searchPath(`template=${value}`);
  };

  return (
    <>
      {results.length > 0 && (
        <section id="card-results" className={sections.section}>
          <h2 className={sections.sectionTitle}>Common results</h2>
          <p className={sections.sectionNote}>What the most popular combos with {card.name} achieve.</p>
          <ul className={sections.chipList}>
            {results.map((result) => (
              <li key={result.name}>
                <Chip
                  href={resultSearch(result.name)}
                  title={`Search the combos with ${card.name} that result in ${result.name}`}
                >
                  <TextWithMagicSymbol text={result.name} />
                  <span className={sections.chipCount}>{result.count}</span>
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      )}
      {(templates.length > 0 || features.length > 0) && (
        <section id="card-roles" className={sections.section}>
          <h2 className={sections.sectionTitle}>Combo roles</h2>
          {templates.length > 0 && (
            <>
              <p className={sections.sectionNote}>
                {card.name} can stand in for these generic cards, so it also fits the combos that require them.
              </p>
              <ul className={`${sections.chipList} mb-4`}>
                {templates.map((template) => (
                  <li key={template.id}>
                    <Chip
                      href={templateSearch(template.name)}
                      title={`Search the combos that require ${template.name}`}
                    >
                      <TextWithMagicSymbol text={template.name} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </>
          )}
          {features.length > 0 && (
            <>
              <p className={sections.sectionNote}>What {card.name} provides to the combos it is part of.</p>
              <ul className={sections.chipList}>
                {features.map((feature) => (
                  <li key={feature}>
                    <Chip>
                      <TextWithMagicSymbol text={feature} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  );
};

export default CardRoles;
