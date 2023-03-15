import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ComboResults from "../components/search/ComboResults/ComboResults";
import getFeaturedCombos from "../lib/getFeaturedCombos";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {
  serializeCombo,
  deserializeCombo,
  SerializedCombo,
} from "../lib/serialize-combo";

const Featured = ({
  serializedCombos,
}: {
  serializedCombos: SerializedCombo[];
}) => {
  const combos = serializedCombos.map((combo) => deserializeCombo(combo));

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Featured Combos"
        description="The newest featured EDH combos on Commander Spellbook."
      />
      <div className="static-page">
        <ArtCircle
          cardName="Thespian's Stage"
          className="m-auto md:block hidden"
        />
        <h1 className="heading-title">Featured Combos</h1>
        <div className="container sm:flex flex-row">
          {!!combos.length ? (
            <div className="w-full">
              <ComboResults results={combos} />
            </div>
          ) : (
            <div>
              <p>No featured combos at this time!</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export async function getStaticProps() {
  const combos = await getFeaturedCombos();
  const serializedCombos = combos.map((combo) => {
    return serializeCombo(combo);
  });

  return {
    props: {
      serializedCombos,
    },
  };
}

export default Featured;
