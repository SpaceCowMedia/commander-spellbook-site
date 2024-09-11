import { PaginatedVariantList, Variant, VariantsApi } from "@spacecowmedia/spellbook-client";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ComboResults from "../components/search/ComboResults/ComboResults";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import { GetServerSideProps } from "next";
import { apiConfiguration } from "services/api.service";
import React from "react";

type Props = {
  combos: Variant[];
};

const Featured: React.FC<Props> = ({ combos }) => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Featured Combos"
        description="The newest featured EDH combos on Commander Spellbook."
      />
      <div className="static-page">
        <ArtCircle cardName="Thespian's Stage" className="m-auto md:block hidden" />
        <h1 className="heading-title">Featured Combos</h1>
        <div className="container sm:flex flex-row">
          {combos.length ? (
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
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const configuration = apiConfiguration(context);
  const variantsApi = new VariantsApi(configuration);
  const results: Variant[] = [];
  let result: PaginatedVariantList;
  do {
    result = await variantsApi.variantsList({
      q: "is:featured legal:commander",
      ordering: "identity_count,cards_count,-created",
      offset: results.length,
    });
    results.push(...result.results);
  } while (result.next);
  return {
    props: {
      combos: results,
    },
  };
};

export default Featured;
