import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ComboResults from "../components/search/ComboResults/ComboResults";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {GetServerSideProps} from "next";
import {RequestService} from "../services/request.service";
import {PaginatedResponse} from "../types/api";
import {Variant} from "../lib/types";

type Props = {
  combos: Variant[];
};

const Featured = ({ combos }: Props) => {

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const requestService = new RequestService(context)
  const results = await requestService.get<PaginatedResponse<Variant>>(`https://${process.env.EDITOR_BACKEND_URL}/variants/?q=is:featured`)
  const backendCombos = results ? results.results : []
  return {
    props: {
      combos: backendCombos,
    }
  }
}

export default Featured;
