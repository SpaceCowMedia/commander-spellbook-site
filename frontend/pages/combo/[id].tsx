import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import { findByIdCompressed } from "../../lib/find-by-id";
import pluralize from "pluralize";
import CardHeader from "../../components/combo/CardHeader/CardHeader";
import CardGroup from "../../components/combo/CardGroup/CardGroup";
import ColorIdentity from "../../components/layout/ColorIdentity/ColorIdentity";
import ComboList from "../../components/combo/ComboList/ComboList";
import styles from "./combo.module.scss";
import ComboSidebarLinks from "../../components/combo/ComboSidebarLinks/ComboSidebarLinks";
import getAllCombos from "../../lib/get-all-combos";
import { GetStaticPaths } from "next";
import { CompressedApiResponse } from "../../lib/types";
import formatApiResponse from "../../lib/format-api-response";
import SpellbookHead from "../../components/SpellbookHead/SpellbookHead";
import React from "react";

type Props = {
  compressedCombo: CompressedApiResponse;
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

const Combo = ({ compressedCombo }: Props) => {
  const combo = formatApiResponse([compressedCombo])[0];

  const data: ComboData = {
    commanderSpellbookId: combo.commanderSpellbookId,
    edhrecLink: combo.edhrecLink,
    numberOfDecks: combo.numberOfEDHRECDecks,
    comboNumber: combo.commanderSpellbookId,
    hasBannedCard: combo.hasBannedCard,
    hasPreviewedCard: combo.hasSpoiledCard,
    link: combo.permalink,
    cards: combo.cards.map((card) => ({
      name: card.name,
      artUrl: card.getImageUrl("artCrop"),
      oracleImageUrl: card.getImageUrl("oracle"),
    })),
    prerequisites: Array.from(combo.prerequisites),
    steps: Array.from(combo.steps),
    results: Array.from(combo.results),
    colorIdentity: Array.from(combo.colorIdentity.colors),
    prices: {
      tcgplayer: "",
      cardkingdom: "",
    },
    loaded: true,
  };

  const {
    cards,
    numberOfDecks,
    loaded,
    colorIdentity,
    prerequisites,
    steps,
    results,
    hasBannedCard,
    hasPreviewedCard,
    link,
    edhrecLink,
    comboNumber,
    prices,
  } = data;

  const cardNames = cards.map((card) => card.name);
  const cardArts = cards.map((card) => card.artUrl);
  const title =
    cardNames.length === 0
      ? "Looking up Combo"
      : cardNames.slice(0, 3).join(" | ");
  const subtitle =
    cards.length < 4
      ? ""
      : cards.length === 4
      ? `(and ${NUMBERS[1]} other card)`
      : `(and ${NUMBERS[cards.length - 3]} other cards)`;
  const metaData =
    numberOfDecks > 0
      ? [
          `In ${numberOfDecks} ${pluralize(
            "deck",
            numberOfDecks
          )} according to EDHREC.`,
        ]
      : [];

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
            <ColorIdentity colors={colorIdentity} />
          </div>

          <ComboList
            title="Cards"
            id="combo-cards"
            className="lg:hidden"
            includeCardLinks
            cardsInCombo={cardNames}
            iterations={cardNames}
          />

          <ComboList
            title="Prerequisites"
            id="combo-prerequisites"
            iterations={prerequisites}
            cardsInCombo={cardNames}
          />

          <ComboList
            title="Steps"
            id="combo-steps"
            iterations={steps}
            cardsInCombo={cardNames}
            showNumbers
          />

          <ComboList
            title="Results"
            id="combo-results"
            iterations={results}
            cardsInCombo={cardNames}
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
              <ColorIdentity colors={colorIdentity} />
            </div>

            {hasBannedCard && (
              <div className={styles.bannedWarning}>
                WARNING: Combo contains cards that are banned in Commander
              </div>
            )}

            {hasPreviewedCard && (
              <div className={styles.previewedWarning}>
                WARNING: Combo contains cards that have not been released yet
                (and are not yet legal in Commander)
              </div>
            )}

            <ComboSidebarLinks
              cards={cardNames}
              comboLink={link}
              edhrecLink={edhrecLink}
              comboId={comboNumber}
              tcgPlayerPrice={prices.tcgplayer}
              cardKingdomPrice={prices.cardkingdom}
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

  return { paths, fallback: false };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {
  const combo = await findByIdCompressed(params.id);

  if (!combo) {
    return {
      redirect: {
        destination: "/combo-not-found",
        permanent: false,
      },
    };
  }

  return {
    props: {
      compressedCombo: combo,
    },
  };
};
