import React from 'react';
import ArtCircle from '../components/layout/ArtCircle/ArtCircle';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { apiConfiguration } from 'services/api.service';
import { PropertiesApi, ResponseError } from '@space-cow-media/spellbook-client';

const MissingComboOfTheDay: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Combo of the Day"
        description="Every day, we feature a new combo from the Commander Spellbook database."
      />
      <div className={`static-page`}>
        <ArtCircle cardName="Kethis, the Hidden Hand" className="m-auto md:block hidden" />
        <h1 className="heading-title">Combo of the Day</h1>

        <div className="text-center">
          <p>Today we are missing a combo of the day. Please check back later or tomorrow.</p>
          <Link role="button" className="button" href="/">
            Go back to the homepage
          </Link>
        </div>
      </div>
    </>
  );
};

export default MissingComboOfTheDay;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const configuration = apiConfiguration(context);
  const propertiesApi = new PropertiesApi(configuration);
  try {
    const comboOfTheDayData = await propertiesApi.propertiesRetrieve({ key: 'combo_of_the_day' });
    if (comboOfTheDayData.value) {
      return {
        redirect: {
          destination: `/combo/${comboOfTheDayData.value}`,
          permanent: false,
        },
      };
    }
  } catch (err) {
    if (!(err instanceof ResponseError && err.response.status === 404)) {
      throw err;
    }
  }
  return {
    props: {},
  };
};
