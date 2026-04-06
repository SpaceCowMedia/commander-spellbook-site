import pluralize from 'pluralize';
import CardHeader from '../../../components/combo/CardHeader/CardHeader';
import CardGroup from '../../../components/combo/CardGroup/CardGroup';
import ColorIdentity from '../../../components/layout/ColorIdentity/ColorIdentity';
import ComboList from '../../../components/combo/ComboList/ComboList';
import styles from './combo.module.scss';
import ComboSidebarLinks from '../../../components/combo/ComboSidebarLinks/ComboSidebarLinks';
import { GetServerSideProps } from 'next';
import SpellbookHead from '../../../components/SpellbookHead/SpellbookHead';
import React, { useEffect, useState } from 'react';
import PrerequisiteList from '../../../components/combo/PrerequisiteList/PrerequisiteList';
import { getPrerequisiteList } from '../../../lib/prerequisitesProcessor';
import EDHRECService from '../../../services/edhrec.service';
import NoCombosFound from 'components/layout/NoCombosFound/NoCombosFound';
import {
  EstimateBracketApi,
  EstimateBracketResult,
  FindMyCombosApi,
  ResponseError,
  Template,
  Variant,
  VariantAliasesApi,
  VariantsApi,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import BulkApiService from 'services/bulk-api.service';
import Loader from 'components/layout/Loader/Loader';
import ComboResults from 'components/search/ComboResults/ComboResults';
import Link from 'next/link';
import Icon from 'components/layout/Icon/Icon';
import { DEFAULT_ORDERING, IS_LOCK } from 'lib/constants';
import ScryfallService, { ScryfallResultsPage } from 'services/scryfall.service';
import ExternalLink from 'components/layout/ExternalLink/ExternalLink';
import { BRACKET_NAME_MAP, BRACKET_RANGE_MAP } from 'lib/brackets';
import BracketInfo from 'components/combo/BracketInfo/BracketInfo';

interface Props {
  combo?: Variant;
  alternatives?: Variant[];
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const MAX_VARIANTS_COUNT = 50;

function booleanToIcon(value: boolean) {
  return value ? <Icon name={'check'} className="text-green-500" /> : <Icon name={'cross'} className="text-red-500" />;
}

const Combo: React.FC<Props> = ({ combo, alternatives }) => {
  const [variants, setVariants] = useState<Variant[]>();
  const [variantCount, setVariantCount] = useState((combo?.variantCount ?? 1) - 1);
  const [templateReplacements, setTemplateReplacements] = useState<
    ReadonlyMap<number, readonly Promise<ScryfallResultsPage>[]>
  >(new Map<number, Promise<ScryfallResultsPage>[]>());
  const configuration = apiConfiguration();
  const variantsApi = new VariantsApi(configuration);
  const bracketApi = new EstimateBracketApi(configuration);
  const [bracketEstimate, setBracketEstimate] = useState<EstimateBracketResult>();

  async function fetchResultsPage(template: Template, page: number): Promise<ScryfallResultsPage> {
    let cache = templateReplacements.get(template.id);
    if (!cache) {
      cache = [];
    }
    for (const cachedPage of cache) {
      const r = await cachedPage;
      if (r.page == page) {
        return r;
      }
    }
    const newPage = ScryfallService.templateReplacements(template, page);
    cache = cache.concat(newPage);
    setTemplateReplacements((prev) => new Map(prev).set(template.id, cache));
    return newPage;
  }

  const loadVariants = async (combo: Variant) => {
    setVariants(undefined);
    try {
      const variants = await variantsApi.variantsList({
        groupByCombo: false,
        variant: combo.id,
        limit: MAX_VARIANTS_COUNT,
        ordering: DEFAULT_ORDERING,
        q: `-sid:"${combo.id}"`,
        count: true,
      });
      setVariantCount(variants.count || variantCount);
      setVariants(variants.results);
    } catch (err) {
      console.error('Error fetching variants', err);
    }
  };

  const loadBracketEstimate = async (combo: Variant) => {
    setBracketEstimate(undefined);
    try {
      const estimate = await bracketApi.estimateBracketCreate({
        deckRequest: {
          commanders: combo.uses
            .filter((use) => use.mustBeCommander)
            .map((use) => ({ card: use.card.name, quantity: use.quantity }))
            .concat(
              combo.requires
                .filter((require) => require.mustBeCommander)
                .map((require) => ({ card: require.template.name, quantity: require.quantity })),
            ),
          main: combo.uses
            .filter((use) => !use.mustBeCommander)
            .map((use) => ({ card: use.card.name, quantity: use.quantity }))
            .concat(
              combo.requires
                .filter((require) => !require.mustBeCommander)
                .map((require) => ({ card: require.template.name, quantity: require.quantity })),
            ),
        },
      });
      setBracketEstimate(estimate);
    } catch (err) {
      console.error('Error fetching bracket estimate', err);
    }
  };

  useEffect(() => {
    if (combo && combo.variantCount > 1) {
      loadVariants(combo);
    }
    if (combo) {
      loadBracketEstimate(combo);
    }
  }, [combo]);

  if (combo) {
    const cardArts = combo.uses.map((card) => card.card.imageUriFrontArtCrop).filter((uri) => uri != null);
    const cardNamesWithQuantities = combo.uses.map((card) =>
      card.quantity > 1 ? `${card.quantity} ${card.card.name}` : card.card.name,
    );
    const title = combo.uses.length === 0 ? 'No specific cards' : cardNamesWithQuantities.slice(0, 3).join(' | ');
    const titleCount = combo.uses.slice(0, 3).reduce((a, b) => a + b.quantity, 0);
    const templateNamesWithQuantities = combo.requires.map((template) =>
      template.quantity > 1 ? `${template.quantity}x ${template.template.name}` : template.template.name,
    );
    const totalCount =
      combo.uses.reduce((a, b) => a + b.quantity, 0) + combo.requires.reduce((a, b) => a + b.quantity, 0);
    const subtitle =
      totalCount === titleCount
        ? ''
        : totalCount === titleCount + 1
          ? `(and ${NUMBERS[1]} other card)`
          : `(and ${NUMBERS[totalCount - titleCount]} other cards)`;
    const numberOfDecks = combo.popularity;
    const metaData = [];

    const identity = combo.identity;
    const prerequisites = getPrerequisiteList(combo);
    const steps = combo.description?.split('\n');
    const notes = combo.notes?.split('\n')?.filter((note) => note.length > 0);
    const isLock = combo.produces.some((feature) => feature.feature.name.toLowerCase() === 'lock');
    const results = combo.produces
      .filter((feature) => feature.feature.name.toLowerCase() !== 'lock')
      .map((feature) => (feature.quantity > 1 ? `${feature.quantity} ${feature.feature.name}` : feature.feature.name));

    // metadata
    if (isLock) {
      metaData.push(IS_LOCK);
    }
    if (combo.status == 'E') {
      metaData.push("This combo is an example of a variant and doesn't provide an explanation.");
    } else if (combo.status == 'D') {
      metaData.push('This combo is a draft and is only visible to editors.');
    } else if (combo.status == 'NR') {
      metaData.push('This combo needs to be reviewed and is only visible to editors.');
    }
    if (numberOfDecks !== undefined && numberOfDecks !== null) {
      metaData.push(`In ${numberOfDecks} ${pluralize('deck', numberOfDecks)} according to EDHREC.`);
    }

    const otherCombosInterferingBracketEstimate =
      bracketEstimate && combo.bracketTag !== bracketEstimate.bracketTag && bracketEstimate.combos.length > 1;

    return (
      <>
        <SpellbookHead
          title={`${title} ${subtitle}`}
          description={results.reduce((str, result) => str + `\n  * ${result}`, 'Combo Results:')}
          // Image URL must be absolute to properly work on Reddit, even though the specification says it can be relative
          imageUrl={`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/combo/${combo.id}/generate-image`}
        />
        <CardHeader cardsArt={cardArts} title={title} subtitle={subtitle} />
        <CardGroup
          key={combo.id}
          cards={combo.uses}
          className={combo.uses.length + combo.requires.length > 4 ? 'hidden md:flex' : ''}
          templates={combo.requires}
          fetchTemplateReplacements={fetchResultsPage}
        />
        <div className="container md:flex flex-row">
          <div className="w-full md:w-2/3">
            <div className="md:hidden pt-4">
              <ColorIdentity identity={identity} />
            </div>

            <ComboList
              title="Cards"
              id="combo-cards"
              className="lg:hidden"
              includeCardLinks
              cardsInCombo={combo.uses}
              templatesInCombo={combo.requires}
              iterations={cardNamesWithQuantities.concat(templateNamesWithQuantities)}
              fetchTemplateReplacements={fetchResultsPage}
            />

            <PrerequisiteList
              prerequisites={prerequisites}
              id="combo-prerequisites"
              cardsInCombo={combo.uses}
              templatesInCombo={combo.requires}
              fetchTemplateReplacements={fetchResultsPage}
            />

            {steps != null && (
              <ComboList
                title="Steps"
                id="combo-steps"
                iterations={steps}
                cardsInCombo={combo.uses}
                templatesInCombo={combo.requires}
                showNumbers
                appendPeriod
                fetchTemplateReplacements={fetchResultsPage}
              />
            )}

            {notes != null && notes.length > 0 && (
              <ComboList
                title="Notes"
                id="combo-notes"
                iterations={notes}
                cardsInCombo={combo.uses}
                templatesInCombo={combo.requires}
                appendPeriod
                fetchTemplateReplacements={fetchResultsPage}
              />
            )}

            <ComboList
              title="Results"
              id="combo-results"
              iterations={results}
              cardsInCombo={combo.uses}
              templatesInCombo={combo.requires}
              appendPeriod
              fetchTemplateReplacements={fetchResultsPage}
            />

            {metaData.length > 0 && <ComboList title="Metadata" id="combo-metadata" iterations={metaData} />}
            {!!combo.bracketTag && (
              <div>
                <h2 className="font-bold text-xl mb-2">Bracket Tag</h2>
                <p>
                  This combo has been estimated to be{' '}
                  <span className={styles.bracketTag}>{BRACKET_NAME_MAP[combo.bracketTag]}</span> (Bracket{' '}
                  <span className={styles.bracketTag}>{BRACKET_RANGE_MAP[combo.bracketTag]}</span>).
                  {otherCombosInterferingBracketEstimate && (
                    <>
                      <br />
                      However, this combo includes other combos which raise the bracket estimate to{' '}
                      <span className={styles.bracketTag}>
                        {BRACKET_NAME_MAP[bracketEstimate.bracketTag]}
                      </span> (Bracket{' '}
                      <span className={styles.bracketTag}>{BRACKET_RANGE_MAP[bracketEstimate.bracketTag]}</span>). Those
                      combos are:{' '}
                      <ComboResults
                        results={bracketEstimate.combos.filter((c) => c.combo.id != combo.id)}
                        hideVariants={true}
                      />
                    </>
                  )}
                </p>
                <BracketInfo bracketEstimate={bracketEstimate} singleCombo={!otherCombosInterferingBracketEstimate} />
                <div className="flex justify-center">
                  <ExternalLink
                    href="https://magic.wizards.com/en/news/announcements?search=%22commander+brackets%22"
                    className="text-center"
                  >
                    Learn more about the Commander format bracket system
                  </ExternalLink>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full md:w-1/3 text-center">
            <div id="combo-color-identity" className="my-4 hidden md:block">
              <ColorIdentity identity={identity} />
            </div>

            {!combo.legalities?.commander && (
              <div className={styles.bannedWarning}>WARNING: Combo contains cards that are banned in Commander</div>
            )}

            {combo.spoiler && (
              <div className={styles.previewedWarning}>
                WARNING: Combo contains cards that have not been released yet (and are not yet legal in Commander)
              </div>
            )}

            <ComboSidebarLinks
              cards={combo.uses.map((card) => card.card.name)}
              edhrecLink={combo.popularity && combo.popularity > 0 ? EDHRECService.getComboUrl(combo) : undefined}
              comboId={combo.id}
              tcgPlayerPrice={combo.prices?.tcgplayer || '-'}
              cardKingdomPrice={combo.prices?.cardkingdom || '-'}
              combo={combo}
            />

            <table className={styles.legalityTable}>
              <thead>
                <tr>
                  <th>Legality</th>
                  <th>Format</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{booleanToIcon(combo.legalities.commander)}</td>
                  <td>Commander</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.pauperCommander)}</td>
                  <td>Pauper Commander</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.pauperCommanderMain)}</td>
                  <td>Pauper Commander in 99</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.oathbreaker)}</td>
                  <td>Oathbreaker</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.predh)}</td>
                  <td>PreDH</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.brawl)}</td>
                  <td>Brawl</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.standard)}</td>
                  <td>Standard</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.pioneer)}</td>
                  <td>Pioneer</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.modern)}</td>
                  <td>Modern</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.premodern)}</td>
                  <td>Premodern</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.pauper)}</td>
                  <td>Pauper</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.legacy)}</td>
                  <td>Legacy</td>
                </tr>
                <tr>
                  <td>{booleanToIcon(combo.legalities.vintage)}</td>
                  <td>Vintage</td>
                </tr>
              </tbody>
            </table>
          </aside>
        </div>
        <div className="container flex-row">
          <div className="w-full">
            {variantCount > 0 && (
              <>
                <ComboList
                  title="Variants of this combo"
                  id="combo-variants"
                  iterations={
                    variants === undefined
                      ? []
                      : [
                          `Below you find ${variants.length == variantCount ? `all ${variants.length}` : `${variants.length} out of ${variantCount} total`} variants of this combo, with the alternative cards highlighted.`,
                        ]
                  }
                />
                {variants === undefined && <Loader />}
                {variants && variants.length == 0 && <p>No other variants found</p>}
              </>
            )}
          </div>
          {variants && variants.length > 0 && (
            <ComboResults
              results={variants}
              sort="popularity"
              hideVariants={true}
              decklistMessage=""
              deck={{
                commanders: [],
                main: combo.uses.map((card) => ({
                  card: card.card.name,
                  quantity: card.quantity,
                })),
              }}
            />
          )}
          {variants && variants.length > 0 && (
            <div className="flex justify-center">
              <Link href={`/search?variant=${combo.id}&groupByCombo=false`} className="button">
                Show all {combo.variantCount} variants
              </Link>
            </div>
          )}
        </div>
      </>
    );
  } else if (alternatives) {
    return (
      <>
        <SpellbookHead
          title="Combo Not Found"
          description="The combo you are looking for could not be found. Here are some similar alternatives."
        />
        <div className="static-page">
          <NoCombosFound single={true} alternatives={alternatives} criteria="similar" />
        </div>
      </>
    );
  }
};

export default Combo;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;

  if (!params || !params.id || typeof params.id !== 'string') {
    return {
      notFound: true,
    };
  }

  const configuration = apiConfiguration(context);
  const variantsApi = new VariantsApi(configuration);

  try {
    // 1. Check the backend
    const backendCombo = await variantsApi.variantsRetrieve({ id: params.id });
    return {
      props: {
        combo: backendCombo,
      },
    };
  } catch (err) {
    if (!(err instanceof ResponseError && err.response.status === 404)) {
      throw err;
    }
  }

  const variantAliasesApi = new VariantAliasesApi(configuration);
  try {
    // 2. Check if it's an alias and reroute if it's found
    const alias = await variantAliasesApi.variantAliasesRetrieve({
      id: params.id,
    });
    if (alias.variant) {
      return {
        redirect: {
          destination: `/combo/${alias.variant}`,
          permanent: false,
        },
      };
    }
  } catch (err) {
    if (!(err instanceof ResponseError && err.response.status === 404)) {
      throw err;
    }
  }
  // 3. Check if it's a legacy combo and reroute if it's found
  if (!params.id.includes('-') && !isNaN(Number(params.id))) {
    const legacyComboMap = await BulkApiService.fetchLegacyMap();
    const variantId = legacyComboMap[params.id];
    if (variantId) {
      return {
        redirect: {
          destination: `/combo/${variantId}`,
          permanent: false,
        },
      };
    }
  }

  // 4. Check for alternatives with similar cards taken from the parsed combo id
  const findMyCombosApi = new FindMyCombosApi(configuration);
  const card_ids = params.id.split('--')[0].split('-');
  const results = await findMyCombosApi.findMyCombosCreate({
    deckRequest: {
      main: card_ids.map((id) => ({ card: id })),
      commanders: [],
    },
  });
  const alternatives = results
    ? results.results.included
        .concat(results.results.almostIncluded)
        .concat(results.results.almostIncludedByAddingColors)
    : [];
  if (alternatives.length > 0) {
    return {
      props: {
        alternatives,
      },
    };
  }

  // Finally 404
  return {
    notFound: true,
  };
};
