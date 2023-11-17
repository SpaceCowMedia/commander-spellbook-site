import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import findById from "../../lib/find-by-id";
import pluralize from "pluralize";
import CardHeader from "../../components/combo/CardHeader/CardHeader";
import CardGroup from "../../components/combo/CardGroup/CardGroup";
import ColorIdentity from "../../components/layout/ColorIdentity/ColorIdentity";
import ComboList from "../../components/combo/ComboList/ComboList";
import styles from "./combo.module.scss";
import ComboSidebarLinks from "../../components/combo/ComboSidebarLinks/ComboSidebarLinks";
import getAllCombos from "../../lib/get-all-combos";
import { GetStaticPaths } from "next";
import {
  serializeCombo,
  deserializeCombo,
  SerializedCombo,
} from "lib/serialize-combo";
import SpellbookHead from "../../components/SpellbookHead/SpellbookHead";
import React, { useEffect } from "react";
import { FormattedApiResponse } from "../../lib/types";
import { useState } from "react";
import SplashPage from "../../components/layout/SplashPage/SplashPage";
import { useRouter } from "next/router";
import PrerequisiteList from "../../components/combo/PrerequisiteList/PrerequisiteList";
import {processBackendResponses} from "../../lib/backend-processors";
import formatApiResponse from "../../lib/format-api-response";

type Props = {
  serializedCombo: SerializedCombo;
  retryId?: string;
};

type Price = {
  tcgplayer: string;
  cardkingdom: string;
};
type CardData = {
  name: string;
  oracleImageUrl: string;
  artUrl: string;
};

type ComboData = {
  hasBannedCard: boolean;
  hasPreviewedCard: boolean;
  link: string;
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  prices: Price;
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
  edhrecLink: string;
  numberOfDecks: number;
  commanderSpellbookId: string;
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

const Combo = ({ serializedCombo, retryId }: Props) => {
  const combo = deserializeCombo(serializedCombo)



  const cards = combo.cards.map((card) => {
    return {
      name: card.name,
      artUrl: card.getImageUrl("artCrop"),
      oracleImageUrl: card.getImageUrl("oracle"),
    };
  });
  const cardNames = cards.map((card) => card.name);
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
  const numberOfDecks = combo.numberOfEDHRECDecks;
  const metaData =
    numberOfDecks > 0
      ? [
          `In ${numberOfDecks} ${pluralize(
            "deck",
            numberOfDecks
          )} according to EDHREC.`,
        ]
      : [];

  const colors = Array.from(combo.colorIdentity.colors);
  const prerequisites = Array.from(combo.prerequisites);
  const steps = Array.from(combo.steps);
  const results = Array.from(combo.results);
  const loaded = true;

  return (
    <PageWrapper>
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
      {loaded && <CardGroup cards={cards} />}
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

          { combo.prerequisiteList ?
            <PrerequisiteList prerequisites={combo.prerequisiteList} id="combo-prerequisites" cardsInCombo={cardNames}/>
           :
            <ComboList
              title="Prerequisites"
              id="combo-prerequisites"
              iterations={prerequisites}
              cardsInCombo={cardNames}
            />
          }


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

            {combo.hasBannedCard && (
              <div className={styles.bannedWarning}>
                WARNING: Combo contains cards that are banned in Commander
              </div>
            )}

            {combo.hasSpoiledCard && (
              <div className={styles.previewedWarning}>
                WARNING: Combo contains cards that have not been released yet
                (and are not yet legal in Commander)
              </div>
            )}

            <ComboSidebarLinks
              cards={cardNames}
              comboLink={combo.permalink}
              edhrecLink={combo.edhrecLink}
              comboId={combo.commanderSpellbookId}
              tcgPlayerPrice={combo.cards.getPriceAsString("tcgplayer")}
              cardKingdomPrice={combo.cards.getPriceAsString("cardkingdom")}
            />
          </aside>
        )}
      </div>
    </PageWrapper>
  );
};

export default Combo;

export const getStaticPaths: GetStaticPaths = async () => {
  const combos = await getAllCombos();
  const paths = combos.map((combo) => ({
    params: { id: `${combo.commanderSpellbookId}` },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {
  const combo = await findById(params.id);

  if (!combo) {
    // If the combo is not found, check if it's a legacy combo and reroute if it's found
    if (!params.id.includes('-')) {
      const legacyCombo = await findById(params.id, false, true);
      if (legacyCombo) return {
        redirect: {
          destination: `/combo/${legacyCombo.commanderSpellbookId}`,
          permanent: false,
        },
      };
    }
    // If it's a new combo id, check the backend
    else  {
      try {
        const backendCombo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/variants/${params.id}/`).then(res => res.json());
        if (backendCombo && backendCombo.detail !== 'Not found.') {
          const compressedRes = processBackendResponses([backendCombo], {})
          const formattedCombo = formatApiResponse(compressedRes)[0];
          return {
            props: {
              serializedCombo: serializeCombo(formattedCombo),
            }
          }
        }
      } catch (err) {
        console.log(err);
      }

    }
    // Finally 404
    return {
      notFound: true,
    };
  }

  return {
    props: {
      serializedCombo: serializeCombo(combo),
    },
  };
};
