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
  FindMyCombosApi,
  ResponseError,
  Variant,
  VariantAliasesApi,
  VariantsApi,
} from '@spacecowmedia/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import BulkApiService from 'services/bulk-api.service';
import Loader from 'components/layout/Loader/Loader';
import ComboResults from 'components/search/ComboResults/ComboResults';
import Link from 'next/link';
import Icon from 'components/layout/Icon/Icon';

type Props = {
  combo?: Variant;
  alternatives?: Variant[];
  previewImageUrl?: string;
};

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const MAX_VARIANTS_COUNT = 50;

function booleanToIcon(value: boolean) {
  return value ? <Icon name={'check'} className="text-green-500" /> : <Icon name={'cross'} className="text-red-500" />;
}

const Combo: React.FC<Props> = ({ combo, alternatives, previewImageUrl }) => {
  const configuration = apiConfiguration();
  const variantsApi = new VariantsApi(configuration);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const loadVariants = async (combo: Variant) => {
    setVariantsLoading(true);
    const variants = await variantsApi.variantsList({
      groupByCombo: false,
      variant: combo.id,
      limit: MAX_VARIANTS_COUNT,
      ordering: '-popularity,identity_count,card_count,-created',
      q: `-sid:"${combo.id}"`,
    });
    setVariants(variants.results);
    setVariantsLoading(false);
  };
  useEffect(() => {
    setVariants([]);
    setVariantsLoading(false);
  }, [combo]);
  if ((combo?.variantCount ?? 0) > 1 && combo && variants.length == 0 && !variantsLoading) {
    loadVariants(combo);
  }
  if (combo) {
    const cardArts = combo.uses.map(
      (card) =>
        `https://api.scryfall.com/cards/named?format=image&version=art_crop&exact=${encodeURIComponent(card.card.name)}`,
    );
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
    const metaData =
      numberOfDecks !== undefined && numberOfDecks !== null
        ? [`In ${numberOfDecks} ${pluralize('deck', numberOfDecks)} according to EDHREC.`]
        : [];

    const identity = combo.identity;
    const prerequisites = getPrerequisiteList(combo);
    const steps = combo.description?.split('\n');
    const notes = combo.notes?.split('\n')?.filter((note) => note.length > 0);
    const results = combo.produces.map((feature) =>
      feature.quantity > 1 ? `${feature.quantity} ${feature.feature.name}` : feature.feature.name,
    );
    if (combo.status == 'E') {
      metaData.push("This combo is an example of a variant and doesn't provide an explanation.");
    } else if (combo.status == 'D') {
      metaData.push('This combo is a draft and is only visible to editors.');
    } else if (combo.status == 'NR') {
      metaData.push('This combo needs to be reviewed and is only visible to editors.');
    }

    return (
      <>
        <SpellbookHead
          title={`${title} ${subtitle}`}
          description={results.reduce((str, result) => str + `\n  * ${result}`, 'Combo Results:')}
          imageUrl={previewImageUrl ?? cardArts[0]}
          useCropDimensions
        />
        <CardHeader cardsArt={cardArts} title={title} subtitle={subtitle} />
        <CardGroup key={combo.id} cards={combo.uses} templates={combo.requires} />
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
            />

            <PrerequisiteList
              prerequisites={prerequisites}
              id="combo-prerequisites"
              cardsInCombo={combo.uses}
              templatesInCombo={combo.requires}
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
              />
            )}

            <ComboList
              title="Results"
              id="combo-results"
              iterations={results}
              cardsInCombo={combo.uses}
              templatesInCombo={combo.requires}
              appendPeriod
            />

            {metaData.length > 0 && <ComboList title="Metadata" id="combo-metadata" iterations={metaData} />}
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
              comboLink={`https://commanderspellbook.com/combo/${combo.id}`}
              edhrecLink={EDHRECService.getComboUrl(combo)}
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
            {combo.variantCount > 1 && (
              <>
                <ComboList
                  title="Variants of this combo"
                  id="combo-variants"
                  iterations={
                    variantsLoading
                      ? []
                      : [
                          `Below you find ${variants.length == combo.variantCount - 1 ? `all ${variants.length}` : `${variants.length} out of ${combo.variantCount - 1} total`} variants of this combo, with the alternative cards highlighted.`,
                        ]
                  }
                />
                {variantsLoading && <Loader />}
                {variants.length == 0 && !variantsLoading && <p>No other variants found</p>}
              </>
            )}
          </div>
          {variants.length > 0 && !variantsLoading && (
            <ComboResults
              results={variants}
              sort="popularity"
              hideVariants={true}
              decklistMessage=""
              deck={{
                commanders: [],
                main: combo.uses.map((card) => ({ card: card.card.name, quantity: card.quantity })),
              }}
            />
          )}
          {variants.length > 0 && !variantsLoading && (
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
        previewImageUrl: `/api/combo/${backendCombo.id}/generate-image/`,
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
    const alias = await variantAliasesApi.variantAliasesRetrieve({ id: params.id });
    return {
      redirect: {
        destination: `/combo/${alias.variant}`,
        permanent: false,
      },
    };
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
