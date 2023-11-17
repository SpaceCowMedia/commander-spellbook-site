import SplashPage from "../components/layout/SplashPage/SplashPage";
import { useEffect } from "react";
import random from "../lib/random";
import { useRouter } from "next/router";
import { Url } from "url";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import {RequestService} from "../services/request.service";
import {GetServerSidePropsContext} from "next";

const Random = () => {
  const router = useRouter();

  useEffect(() => {
    let query = router.query.q;
    if (typeof query !== "string") query = "";

    random(query)
      .then((combo) => {
        const url: Partial<Url> = {
          pathname: `/combo/${combo.commanderSpellbookId}`,
        };
        if (query) url.query = `${query}`;
        router.replace(url);
      })
      .catch(() => {
        router.replace("/combo-not-found");
      });
  }, []);

  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Random"
        description="Find a random EDH combo on Commander Spellbook."
      />
      <SplashPage
        title="Randomizing"
        flavor="Ever try to count hyperactive schoolchildren while someone shouts random numbers in your ear? It’s like that."
        artCircleCardName="Chaosphere"
        pulse
      >
        <p>Random combo</p>
      </SplashPage>
    </PageWrapper>
  );
};


export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const requestService = new RequestService(context);
  const combos = await requestService.get("https://backend.commanderspellbook.com/variants/?ordering=%3F&limit=1")
  const randomCombo = combos.results[0];
  if (randomCombo) {
    return {
      redirect: {
        destination: `/combo/${randomCombo.id}`,
        basePath: true,
        permanent: false,
      }
    };
  }
  return {
    notFound: true,
  };
}

export default Random;
