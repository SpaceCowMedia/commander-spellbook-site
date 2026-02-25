import Link from 'next/link';
import Footer from '../components/layout/Footer/Footer';
import SearchBar from '../components/SearchBar/SearchBar';
import SpellbookLogo from '../components/layout/SpellbookLogo/SpellbookLogo';
import RandomButton from '../components/RandomButton/RandomButton';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import UserDropdown from '../components/layout/UserDropdown/UserDropdown';
import { apiConfiguration } from 'services/api.service';
import { PropertiesApi } from '@space-cow-media/spellbook-client';
import { GetStaticProps } from 'next';

interface FeaturedTab {
  id: number;
  title: string;
}

interface Props {
  comboOfTheDay?: string;
  featuredTabs: FeaturedTab[];
}

const Home: React.FC<Props> = ({ featuredTabs, comboOfTheDay }) => {
  const router = useRouter();
  const query = router.query.q ? `${router.query.q}` : ``;

  useEffect(() => {
    const { status, id } = router.query;

    if (Number(query) > 0 || Number(id) > 0) {
      router.push(`/combo/${id || query}/`);
      return;
    }

    if (query === 'spoiled' || status === 'spoiled') {
      router.push('/search/?q=is:previewed');
      return;
    }

    if (query === 'banned' || status === 'banned') {
      router.push('/search/?q=is:banned');
      return;
    }

    if (!query) {
      return;
    }

    router.push(`/search/?q=${query}`);
  }, []);

  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: The Search Engine for EDH Combos"
        description="The Premier Magic: the Gathering Combo Search Engine for the Commander / Elder Dragon Highlander (EDH) Format."
      />
      <main>
        <div className="absolute top-5 right-5 z-20">
          <UserDropdown />
        </div>
        <div className="gradient relative z-10">
          <div className={`container centered-container relative md:h-screen z-10`}>
            <div className="w-full">
              <SpellbookLogo />

              <h2 className="font-title my-1 sm:my-3 text-2xl sm:text-3xl md:text-4xl text-dark">
                The Search Engine for EDH Combos
              </h2>

              <SearchBar onHomepage className="bg-white mt-4 mb-1 md:w-2/3 h-20" />

              <div className="button-links md:flex-row md:w-2/3 m-auto flex flex-col">
                <Link href="/advanced-search/" className={`dark home-button button md:m-1`}>
                  Advanced Search
                </Link>
                <Link href="/syntax-guide/" className={`dark home-button button md:m-1`}>
                  Syntax
                </Link>
                <RandomButton query={query} className={`random-button home-button dark button md:m-1`}>
                  Random
                </RandomButton>
                <Link href="/find-my-combos/" className={`dark home-button button md:m-1`}>
                  Find My Combos
                </Link>
              </div>

              <div className="button-links md:flex-row md:w-2/3 m-auto flex flex-col">
                {featuredTabs.length > 0 &&
                  featuredTabs.map((tab) => (
                    <Link
                      key={tab.id}
                      href={`/search/?q=is:featured-${tab.id}`}
                      className={`previwed-combos-button dark home-button button md:m-1`}
                    >
                      {tab.title}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
          <Footer comboOfTheDay={comboOfTheDay} />
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { NEXT_PUBLIC_EDITOR_BACKEND_URL } = process.env;

  if (!NEXT_PUBLIC_EDITOR_BACKEND_URL) {
    return {
      props: {
        comboOfTheDay: null,
        featuredTabs: [],
      },
      revalidate: 60,
    };
  }

  try {
    const configuration = apiConfiguration();
    const propertiesApi = new PropertiesApi(configuration);
    const res = await propertiesApi.propertiesList();
    const featuredPrefix = 'featured_combos_title_';
    const featuredTabs = res.results
      .filter((data) => data.key.startsWith(featuredPrefix) && data.value)
      .map<FeaturedTab>((data) => ({
        id: Number(data.key.replace(featuredPrefix, '')),
        title: data.value,
      }));
    const comboOfTheDayData = res.results.find((data) => {
      return data.key === 'combo_of_the_day';
    });

    return {
      props: {
        comboOfTheDay: comboOfTheDayData?.value || null,
        featuredTabs,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching data from the editor backend:', error);
    return {
      props: {
        comboOfTheDay: null,
        featuredTabs: [],
      },
      revalidate: 60,
    };
  }
};

export default Home;
