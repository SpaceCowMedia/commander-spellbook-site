import { CardDetail, CardsApi, Template, TemplatesApi, Variant, VariantsApi } from '@space-cow-media/spellbook-client';
import { GetStaticPropsResult } from 'next';
import { apiConfiguration } from 'services/api.service';
import { httpErrorStatus } from 'lib/httpErrors';
import { DEFAULT_ORDERING } from 'lib/constants';
import { cardComboQuery, commanderFormatTerm } from 'lib/cards';
import { CardPartner, CardResult, toListedVariant, topPartners, topResults } from 'lib/cardCombos';

const REVALIDATE_SECONDS = 60 * 60 * 24;
const RETRY_REVALIDATE_SECONDS = 60 * 10;
const NOT_FOUND_REVALIDATE_SECONDS = 60 * 60;
const SAMPLE_SIZE = 100;
const LISTED_COMBOS = 20;
const PARTNER_LIMIT = 8;
const RESULT_LIMIT = 8;
const TEMPLATE_LIMIT = 20;
const CARD_ID = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export interface CardPageProps {
  card: CardDetail;
  formatTerm: string;
  combosCount: number;
  combos: Variant[];
  sampleSize: number;
  partners: CardPartner[];
  results: CardResult[];
  templates: Template[];
}

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

export async function loadCardPage(id: string): Promise<GetStaticPropsResult<CardPageProps>> {
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
    .templatesList({ matches: [canonicalId], limit: TEMPLATE_LIMIT })
    .then(
      (page) => page.results,
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
      results: topResults(combos.sample, RESULT_LIMIT),
      templates: cardTemplates ?? [],
    },
    revalidate: cardTemplates !== null ? REVALIDATE_SECONDS : RETRY_REVALIDATE_SECONDS,
  };
}
