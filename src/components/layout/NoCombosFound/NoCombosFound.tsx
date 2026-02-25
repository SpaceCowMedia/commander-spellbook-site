import styles from './noCombosFound.module.scss';
import SplashPage from '../SplashPage/SplashPage';
import Link from 'next/link';
import ComboResults from 'components/search/ComboResults/ComboResults';
import { Variant } from '@space-cow-media/spellbook-client';
import React from 'react';

interface Props {
  single?: boolean;
  alternatives?: Variant[];
  criteria?: string;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const NoCombosFound: React.FC<Props> = ({ single, alternatives, criteria }) => {
  const title = single ? 'Combo Not Found' : 'No Combos Found';
  const flavor =
    alternatives && alternatives.length > 0
      ? ''
      : 'The final pages of the experiment log were blank. Investigators found it abandoned on a desk in the researcher’s lab, open, the pages flipping in the wind from a shattered window.';
  const options = [
    'try one of the links below',
    single ? 'change the address at the top of your browser' : 'adjust your search',
  ];
  if (alternatives && alternatives.length > 0) {
    options.push(`select a ${criteria} combo from the list below`);
  }
  return (
    <SplashPage
      pulse={false}
      title={title}
      flavor={flavor}
      artCircleCardName={single ? 'Fblthp, the Lost' : 'Frantic Search'}
    >
      <div className={`${styles.noCombosFoundButtons} opacity-100`}>
        <h2 className="heading-subtitle">
          Your {single ? 'address' : 'search'} didn't match any combos.{' '}
          {capitalizeFirstLetter(options.slice(0, -1).join(', '))} or {options[options.length - 1]}.
        </h2>
        <div>
          <Link href="/advanced-search/" className="button">
            Advanced Search
          </Link>
          <Link href="/syntax-guide/" className="button">
            Syntax Guide
          </Link>
          <Link href="/submit-a-combo/" className="button">
            Submit a Combo
          </Link>
        </div>
        {alternatives && alternatives.length > 0 && (
          <div className="container sm:flex flex-row">
            <div className="w-full">
              <ComboResults results={alternatives} />
            </div>
          </div>
        )}
      </div>
    </SplashPage>
  );
};

export default NoCombosFound;
