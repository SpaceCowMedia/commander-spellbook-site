import React from 'react';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import SpellbookHead from 'components/SpellbookHead/SpellbookHead';
import CardBanner from 'components/card/CardBanner/CardBanner';
import CardDetails from 'components/card/CardDetails/CardDetails';
import CardPartners from 'components/card/CardPartners/CardPartners';
import CardRoles from 'components/card/CardRoles/CardRoles';
import CardComboExplorer from 'components/card/CardComboExplorer/CardComboExplorer';
import CardSidebar from 'components/card/CardSidebar/CardSidebar';
import { CardPageProps, loadCardPage } from 'components/card/cardPageData';
import {
  cardCanonicalPath,
  cardDescription,
  cardImagePath,
  cardJsonLd,
  cardSummary,
  cardTitle,
} from 'components/card/cardSeo';
import { submitComboPath } from 'lib/cards';
import { SpoilerContext } from 'lib/spoilers';
import { absoluteUrl } from 'lib/seo';
import styles from './card.module.scss';

const CardPage: React.FC<CardPageProps> = (props) => {
  const { card, formatTerm, combosCount, combos, partners, sampleSize, results, templates } = props;
  const legalButBannedCombos = card.legalities.commander && formatTerm !== 'legal:commander';
  return (
    <SpoilerContext value={card.spoiler}>
      <SpellbookHead
        title={cardTitle(props)}
        description={cardDescription(props)}
        canonicalPath={cardCanonicalPath(card)}
        noindex={!card.id || combosCount === 0}
        imageUrl={absoluteUrl(cardImagePath(card))}
        imageWidth={1200}
        imageHeight={630}
        imageAlt={`${card.name}: card and combo summary`}
        jsonLd={cardJsonLd(props)}
      />
      <CardBanner card={card} />
      <div className="container md:flex flex-row gap-8">
        <div className="w-full md:w-2/3">
          <CardDetails card={card} summary={cardSummary(props)} />
          {combosCount > 0 ? (
            <>
              {legalButBannedCombos && (
                <p className={styles.notice}>
                  Every combo with {card.name} also needs a card that is banned in Commander.
                </p>
              )}
              <CardPartners
                cardName={card.name}
                partners={partners}
                sampleSize={sampleSize}
                combosCount={combosCount}
              />
            </>
          ) : (
            <section id="card-no-combos" className={styles.empty}>
              <h2 className="font-bold text-xl mb-2">No combos yet</h2>
              <p>
                Commander Spellbook doesn&apos;t list any combo with {card.name} yet. Know one?{' '}
                <Link href={submitComboPath(card.name)} title={`Suggest a new combo that uses ${card.name}`}>
                  Submit it
                </Link>
                .
              </p>
            </section>
          )}
          <CardRoles card={card} formatTerm={formatTerm} results={results} templates={templates} />
        </div>
        <aside className="w-full md:w-1/3 text-center">
          <CardSidebar card={card} />
        </aside>
      </div>
      {combosCount > 0 && (
        <div className="container">
          <CardComboExplorer card={card} formatTerm={formatTerm} combosCount={combosCount} initialCombos={combos} />
        </div>
      )}
    </SpoilerContext>
  );
};

export default CardPage;

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export const getStaticProps: GetStaticProps<CardPageProps, { id: string }> = async ({ params }) =>
  loadCardPage(params?.id ?? '');
