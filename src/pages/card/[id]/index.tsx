import React from 'react';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import {
  CardDetail,
  CardsApi,
  TemplateDetail,
  TemplatesApi,
  Variant,
  VariantsApi,
} from '@space-cow-media/spellbook-client';
import SpellbookHead from 'components/layout/SpellbookHead/SpellbookHead';
import CardsBanner from 'components/card/CardsBanner/CardsBanner';
import CardName from 'components/card/CardName/CardName';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import CardDetails from 'components/card/CardDetails/CardDetails';
import CardPartners from 'components/card/CardPartners/CardPartners';
import CardRoles from 'components/card/CardRoles/CardRoles';
import CardComboExplorer from 'components/card/CardComboExplorer/CardComboExplorer';
import CardSidebar from 'components/card/CardSidebar/CardSidebar';
import {
  cardCanonicalPath,
  cardDescription,
  cardImagePath,
  cardJsonLd,
  cardSummary,
  cardTitle,
} from 'components/card/cardSeo';
import { apiConfiguration } from 'services/api.service';
import { httpErrorStatus } from 'lib/http/httpErrors';
import { DEFAULT_ORDERING } from 'lib/constants';
import { cardComboQuery, commanderFormatTerm, submitComboPath } from 'lib/cards';
import { CardPartner, toListedVariant, topPartners } from 'lib/cardCombos';
import { SpoilerContext } from 'lib/card/spoilers';
import { absoluteUrl } from 'lib/seo';
import styles from './card.module.scss';

const REVALIDATE_SECONDS = 60 * 60 * 24;
const RETRY_REVALIDATE_SECONDS = 60 * 10;
const NOT_FOUND_REVALIDATE_SECONDS = 60 * 60;
const SAMPLE_SIZE = 100;
const LISTED_COMBOS = 20;
const PARTNER_LIMIT = 8;
const TEMPLATE_LIMIT = 20;
const CARD_ID = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export interface CardPageProps {
  card: CardDetail;
  formatTerm: string;
  combosCount: number;
  combos: Variant[];
  sampleSize: number;
  partners: CardPartner[];
  templates: TemplateDetail[];
}

const CardPage: React.FC<CardPageProps> = (props) => {
  const { card, formatTerm, combosCount, combos, partners, sampleSize, templates } = props;
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
      <CardsBanner
        cards={[card]}
        title={<CardName name={card.name} />}
        subtitle={
          <>
            {card.typeLine}
            {card.manaCost && (
              <>
                {' · '}
                <TextWithMagicSymbol text={card.manaCost} />
              </>
            )}
          </>
        }
      />
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
          <CardRoles card={card} templates={templates} />
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

interface CardCombos {
  formatTerm: string;
  combosCount: number;
  sample: Variant[];
}

const NO_COMBOS: Omit<CardCombos, 'formatTerm'> = { combosCount: 0, sample: [] };

function loadSample(card: CardDetail, formatTerm: string) {
  return new VariantsApi(apiConfiguration()).variantsList({
    q: cardComboQuery(card, formatTerm),
    groupByCombo: false,
    ordering: DEFAULT_ORDERING,
    limit: SAMPLE_SIZE,
    count: true,
  });
}

/* Cards are queried even when their variant count is zero, because that count is maintained apart
   from the variants and can lag behind them. */
async function loadCardCombos(card: CardDetail): Promise<CardCombos> {
  let formatTerm = commanderFormatTerm(card.legalities.commander);
  let sample = await loadSample(card, formatTerm);
  if (sample.results.length === 0 && card.legalities.commander) {
    formatTerm = commanderFormatTerm(false);
    sample = await loadSample(card, formatTerm);
  }
  const combosCount = sample.count ?? sample.results.length;
  if (combosCount === 0) {
    return { formatTerm: commanderFormatTerm(card.legalities.commander), ...NO_COMBOS };
  }
  return { formatTerm, combosCount, sample: sample.results };
}

export const getStaticProps: GetStaticProps<CardPageProps, { id: string }> = async ({ params }) => {
  const id = params?.id ?? '';
  if (!CARD_ID.test(id)) {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE_SECONDS };
  }
  const configuration = apiConfiguration();
  let card: CardDetail;
  try {
    card = await new CardsApi(configuration).cardsRetrieve({ id });
  } catch (error) {
    const status = httpErrorStatus(error);
    if (status === 404 || status === 400) {
      return { notFound: true, revalidate: NOT_FOUND_REVALIDATE_SECONDS };
    }
    throw error;
  }
  const canonicalId = card.id ? String(card.id) : card.oracleId;
  if (!canonicalId) {
    return { notFound: true, revalidate: NOT_FOUND_REVALIDATE_SECONDS };
  }
  if (canonicalId !== id) {
    return { redirect: { destination: `/card/${canonicalId}/`, permanent: true }, revalidate: REVALIDATE_SECONDS };
  }

  const templates = new TemplatesApi(configuration)
    .templatesList({ matches: [canonicalId], ordering: '-variant_count,name', limit: TEMPLATE_LIMIT })
    .then(
      (page) => page.results.filter((template) => template.variantCount > 0),
      (error) => {
        console.error(`Error fetching the templates of card ${canonicalId}`, error);
        return null;
      },
    );
  const combos: CardCombos = card.id
    ? await loadCardCombos(card)
    : { formatTerm: commanderFormatTerm(card.legalities.commander), ...NO_COMBOS };
  const cardTemplates = await templates;

  return {
    props: {
      card,
      formatTerm: combos.formatTerm,
      combosCount: combos.combosCount,
      combos: combos.sample.slice(0, LISTED_COMBOS).map(toListedVariant),
      sampleSize: combos.sample.length,
      partners: topPartners(card, combos.sample, PARTNER_LIMIT),
      templates: cardTemplates ?? [],
    },
    revalidate: cardTemplates !== null ? REVALIDATE_SECONDS : RETRY_REVALIDATE_SECONDS,
  };
};
