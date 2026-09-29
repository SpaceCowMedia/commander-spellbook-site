import React from 'react';
import SplashPage from '../components/layout/SplashPage/SplashPage';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { withApiErrorPage } from 'lib/apiErrorPage';
import { apiConfiguration } from 'services/api.service';
import { VariantsApi } from '@space-cow-media/spellbook-client';

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

export const getServerSideProps = withApiErrorPage(async (context) => {
  const configuration = apiConfiguration(context);
  const variantsApi = new VariantsApi(configuration);
  const combos = await variantsApi.variantsList({
    limit: 1,
    ordering: '?',
    q: 'legal:commander',
    groupByCombo: false,
  });
  if (combos.results.length > 0) {
    const randomCombo = combos.results[0];
    // The combo was not searched for, so the destination declares an empty query: whatever the
    // search bar was carrying before is cleared rather than left describing an unrelated search.
    return {
      redirect: {
        destination: `/combo/${randomCombo.id}?q=`,
        permanent: false,
      },
    };
  }
  return {
    notFound: true,
  };
});

export default Random;
