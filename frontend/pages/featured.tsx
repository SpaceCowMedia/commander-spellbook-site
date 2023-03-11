import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import {FormattedApiResponse} from "../lib/types";
import {useEffect, useState} from "react";
import ComboResults from "../components/search/ComboResults/ComboResults";
import getFeaturedCombos from "../lib/getFeaturedCombos";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";


const Featured = () => {

  const [combos, setCombos] = useState<FormattedApiResponse[]>([])
  
  useEffect(() => {
    getFeaturedCombos().then(setCombos)
  }, [])

  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: Featured Combos" description="The newest featured EDH combos on Commander Spellbook."/>
      <div className="static-page">
        <ArtCircle cardName="Thespian's Stage" className="m-auto md:block hidden" />
        <h1 className="heading-title">Featured Combos</h1>
        <div className="container sm:flex flex-row">
          {!!combos.length ? (
            <div className="w-full">
              <ComboResults results={combos} />
            </div>
          ) : <div><p>No featured combos at this time!</p></div>}
        </div>
      </div>
    </PageWrapper>
  )
}

export default Featured