import pluralize from "pluralize";
import CardHeader from "../../components/combo/CardHeader/CardHeader";
import CardGroup from "../../components/combo/CardGroup/CardGroup";
import ColorIdentity from "../../components/layout/ColorIdentity/ColorIdentity";
import ComboList from "../../components/combo/ComboList/ComboList";
import styles from "./combo.module.scss";
import ComboSidebarLinks from "../../components/combo/ComboSidebarLinks/ComboSidebarLinks";
import {GetStaticPaths, GetStaticProps} from "next";
import SpellbookHead from "../../components/SpellbookHead/SpellbookHead";
import React from "react";
import { Variant} from "../../lib/types";
import PrerequisiteList from "../../components/combo/PrerequisiteList/PrerequisiteList";
import {getPrerequisiteList} from "../../lib/backend-processors";
import EDHRECService from "../../services/edhrec.service";
import variantService from "../../services/variant.service";
import ErrorBase from "../../components/layout/ErrorBase/ErrorBase";
import ComboResults from "../../components/search/ComboResults/ComboResults";
import ArtCircle from "../../components/layout/ArtCircle/ArtCircle";
import findMyCombosService from "../../services/findMyCombos.service";

type Props = {
  combo?: Variant;
  alternatives?: Variant[];
};

const NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const Combo = ({ combo, alternatives }: Props) => {
  if (combo) {
    const cards = combo.uses.map((card) => {
      return {
        name: card.card.name,
        artUrl: `https://api.scryfall.com/cards/named?format=image&version=art_crop&exact=${card.card.name}`,
        oracleImageUrl: `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${card.card.name}`,
      };
    });
    const cardNames = combo.uses.map(card => card.card.name)
    const cardArts = cards.map((card) => card.artUrl);
    const title =
      cardNames.length === 0
        ? "Looking up Combo"
        : cardNames.slice(0, 3).join(" | ");
    const subtitle =
      cardNames.length < 4
        ? ""
        : cardNames.length === 4
        ? `(and ${NUMBERS[1]} other card)`
        : `(and ${NUMBERS[cardNames.length - 3]} other cards)`;
    const numberOfDecks = combo.popularity;
    const metaData =
      numberOfDecks !== undefined && numberOfDecks !== null
        ? [
            `In ${numberOfDecks} ${pluralize(
              "deck",
              numberOfDecks
            )} according to EDHREC.`,
          ]
        : [];

    const colors = Array.from(combo.identity)
    const prerequisites = getPrerequisiteList(combo)
    const steps = combo.description.split('\n');
    const results = combo.produces.map(feature => feature.name)
    const loaded = true;

    return (
      <>
        <SpellbookHead
          title={`${title} ${subtitle}`}
          description={results.reduce(
            (str, result) => str + `\n  * ${result}`,
            "Combo Results:"
          )}
          imageUrl={cardArts[0]}
          useCropDimensions
        />
        <CardHeader cardsArt={cardArts} title={title} subtitle={subtitle} />
        {loaded && <CardGroup key={combo.id} cards={cards} />}
        <div className="container md:flex flex-row">
          <div className="w-full md:w-2/3">
            <div className="md:hidden pt-4">
              <ColorIdentity colors={colors} />
            </div>

            <ComboList
              title="Cards"
              id="combo-cards"
              className="lg:hidden"
              includeCardLinks
              cardsInCombo={cardNames}
              iterations={cardNames}
            />

            <PrerequisiteList prerequisites={prerequisites} id="combo-prerequisites" cardsInCombo={cardNames}/>

            <ComboList
              title="Steps"
              id="combo-steps"
              iterations={steps}
              cardsInCombo={cardNames}
              showNumbers
              appendPeriod
            />

            <ComboList
              title="Results"
              id="combo-results"
              iterations={results}
              cardsInCombo={cardNames}
              appendPeriod
            />

            {metaData.length > 0 && (
              <ComboList
                title="Metadata"
                id="combo-metadata"
                iterations={metaData}
              />
            )}
          </div>

          {loaded && (
            <aside className="w-full md:w-1/3 text-center">
              <div id="combo-color-identity" className="my-4 hidden md:block">
                <ColorIdentity colors={colors} />
              </div>

              {!combo.legalities?.commander && (
                <div className={styles.bannedWarning}>
                  WARNING: Combo contains cards that are banned in Commander
                </div>
              )}

              {combo.spoiler && (
                <div className={styles.previewedWarning}>
                  WARNING: Combo contains cards that have not been released yet
                  (and are not yet legal in Commander)
                </div>
              )}

              <ComboSidebarLinks
                cards={cardNames}
                comboLink={`https://commanderspellbook.com/combo/${combo.id}`}
                edhrecLink={EDHRECService.getComboUrl(combo)}
                comboId={combo.id}
                tcgPlayerPrice={combo.prices?.tcgplayer || "-"}
                cardKingdomPrice={combo.prices?.cardkingdom || "-"}
              />
            </aside>
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
          <ArtCircle
            cardName="Fblthp, the Lost"
            className="m-auto md:block hidden"
          />
          <h1 className="heading-title">Combo Not Found</h1>
          <h2 className="heading-subtitle">Maybe it's been removed or changed id. Here are some similar alternatives.</h2>
          <div className="container sm:flex flex-row">
            <div className="w-full">
              <ComboResults results={alternatives} />
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default Combo;
export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }; // Do not prerender any paths at build time.
};

export const getStaticProps: GetStaticProps = async ({
  params,
}) => {

  if (!params || !params.id || typeof params.id !== 'string') return {
    notFound: true,
  };

  try {
    // 1. Check the backend
    const backendCombo = await variantService.fetchVariant(params.id)
    if (backendCombo) return {
      props: {
        combo: backendCombo,
        revalidate: 60, // refreshes every minute
      },
    };
    // 2. Check if it's an alias and reroute if it's found
    const alias = await variantService.fetchVariantAlias(params.id);
    if (alias) return {
      redirect: {
        destination: `/combo/${alias.variant}`,
        permanent: false,
      },
    };
    // 3. Check if it's a legacy combo and reroute if it's found
    if (!params.id.includes('-') && !isNaN(Number(params.id))) {
      const legacyComboMap = await variantService.fetchLegacyMap()
      const variantId = legacyComboMap[params.id]
      if (variantId) return {
        redirect: {
          destination: `/combo/${variantId}`,
          permanent: false,
        }
      };
    }
    const card_ids = params.id.split("--")[0].split("-");
    const results = await findMyCombosService.findFromLists([], card_ids);
    const alternatives = results
      ? results.results.almostIncluded.concat(
          results.results.almostIncludedByAddingColors).concat(
            results.results.included) 
      : [];
    if (alternatives.length > 0) return {
      props: {
        alternatives,
        revalidate: 60, // refreshes every minute
      },
    };
  } catch (err) {
    console.log(err);
  }
  // Finally 404
  return {
    notFound: true,
  };
};
