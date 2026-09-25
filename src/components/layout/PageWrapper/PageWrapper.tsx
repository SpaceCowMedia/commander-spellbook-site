import React from 'react';
import Footer from '../Footer/Footer';
import SearchBar from '../../SearchBar/SearchBar';
import styles from './pageWrapper.module.scss';
import AnalyticsCookieBanner from '../AnalyticsCookieBanner/AnalyticsCookieBanner';
import PageTransition from '../PageTransition/PageTransition';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
  transitionKey: string;
  noMarginFooter?: boolean;
}

const PageWrapper: React.FC<Props> = ({ children, transitionKey, noMarginFooter }: Props) => {
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
        <div className={`bg-dark ${styles.locked}`} style={{ viewTransitionName: 'site-header' }}>
          <nav className="container">
            <SearchBar />
          </nav>
          <div className={`gradient ${styles.searchBarBorder}`} />
        </div>
      )}
      <PageTransition key={transitionKey}>
        <div className="flex-1 flex flex-col bg-(--page-background)">
          <div className="flex-1">{children}</div>
          {!isHome && <Footer noMargin={noMarginFooter} className={`mt-24 lg:mt-48 z-0`} />}
        </div>
      </PageTransition>
    </div>
  );
};

export default PageWrapper;
