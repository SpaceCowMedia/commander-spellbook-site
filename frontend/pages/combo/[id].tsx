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

type Props = {
  serializedCombo?: SerializedCombo;
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
  const [combo, setCombo] = useState<FormattedApiResponse | undefined>(
    serializedCombo ? deserializeCombo(serializedCombo) : undefined
  );
  const router = useRouter();

  const fetchCombo = async () => {
    try {
      const localCombo = await findById(`${retryId}`, true); // This should be router.query.id, but this page cannot work dynamically without a server
      setCombo(localCombo);
      router.replace(`/combo/${retryId}`, undefined, { shallow: true });
    } catch (err) {
      router.push("/combo-not-found/");
    }
  };

  useEffect(() => {
    if (!combo) fetchCombo();
  }, []);

  if (!combo) {
    return (
      <PageWrapper>
        <SplashPage
          pulse
          title="Looking up Combo"
          flavor="It took the banning of temporal manipulation at Tolaria West to teach its students the value of time."
          artCircleCardName="Frantic Search"
        >
          <p>This may take a moment...</p>
        </SplashPage>
      </PageWrapper>
    );
  }

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

  return { paths, fallback: false };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {
  const combo = await findById(params.id);

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
      serializedCombo: serializeCombo(combo),
    },
  };
};
