import React from 'react';
import SplashPage from '../components/layout/SplashPage/SplashPage';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { GetServerSidePropsContext } from 'next';
import { apiConfiguration } from 'services/api.service';
import { VariantsApi } from '@spacecowmedia/spellbook-client';

const Random: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const configuration = apiConfiguration(context);
  const variantsApi = new VariantsApi(configuration);
  const combos = await variantsApi.variantsList({
    limit: 1,
    ordering: '?',
    q: 'legal:commander',
  });
  if (combos.results.length > 0) {
    const randomCombo = combos.results[0];
    return {
      redirect: {
        destination: `/combo/${randomCombo.id}`,
        basePath: true,
        permanent: false,
      },
    };
  }
  return {
    notFound: true,
  };
};

export default Random;
