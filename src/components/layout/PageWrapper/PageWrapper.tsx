import React from 'react';
import Footer from '../Footer/Footer';
import SearchBar from '../../SearchBar/SearchBar';
import styles from './pageWrapper.module.scss';
import AnalyticsCookieBanner from '../AnalyticsCookieBanner/AnalyticsCookieBanner';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
  noMarginFooter?: boolean;
}

const PageWrapper: React.FC<Props> = ({ children, noMarginFooter }: Props) => {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const isEmbed = router.pathname.endsWith('/embed');

  if (isEmbed) {
    return <>{children}</>;
  }

  return (
    <div className={`flex flex-col h-full ${!isHome ? styles.padtop : ''}`}>
      <AnalyticsCookieBanner />
      {!isHome && (
        <div className={`bg-dark ${styles.locked}`}>
          <nav className="container">
            <SearchBar />
          </nav>
          <div className={`gradient ${styles.searchBarBorder}`} />
        </div>
      )}
      <div className="flex-1">{children}</div>
      {!isHome && <Footer noMargin={noMarginFooter} className={`mt-24 lg:mt-48 z-0`} />}
    </div>
  );
};

export default PageWrapper;
