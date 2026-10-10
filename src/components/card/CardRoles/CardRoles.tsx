import React from 'react';
import Link from 'next/link';
import { CardDetail, FeatureStatusEnum, TemplateDetail } from '@space-cow-media/spellbook-client';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import { quotedSearchValue, searchPath } from 'lib/cards';
import sections from 'components/card/cardSections.module.scss';

interface Props {
  card: CardDetail;
  templates: TemplateDetail[];
}

const Chip: React.FC<{ href?: string; title?: string; children: React.ReactNode }> = ({ href, title, children }) =>
  href ? (
    <Link href={href} className={sections.chip} title={title}>
      {children}
    </Link>
  ) : (
    <span className={sections.chip}>{children}</span>
  );

const CardRoles: React.FC<Props> = ({ card, templates }) => {
  const features = [
    ...new Set(
      card.features.filter(({ feature }) => feature.status === FeatureStatusEnum.Pu).map(({ feature }) => feature.name),
    ),
  ];
  const templateSearch = (name: string) => {
    const value = quotedSearchValue(name);
    return value && searchPath(`template=${value}`);
  };

  if (templates.length === 0 && features.length === 0) {
    return null;
  }

  return (
    <section id="card-roles" className={sections.section}>
      <h2 className={sections.sectionTitle}>Roles in combos</h2>
      {templates.length > 0 && (
        <>
          <p className={sections.sectionNote}>
            {card.name} can stand in for these generic cards, so it also fits the combos that require them.
          </p>
          <ul className={`${sections.chipList} mb-4`}>
            {templates.map((template) => (
              <li key={template.id}>
                <Chip href={templateSearch(template.name)} title={`Search the combos that require ${template.name}`}>
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
  );
};

export default CardRoles;
