import React from "react";
import Footer from "../Footer/Footer";
import SearchBar from "../../SearchBar/SearchBar";
import styles from "./pageWrapper.module.scss";
import AnalyticsCookieBanner from "../AnalyticsCookieBanner/AnalyticsCookieBanner";

type Props = {
  children: React.ReactNode;
  noMarginFooter?: boolean;
};

const PageWrapper: React.FC<Props> = ({ children, noMarginFooter }: Props) => {
  return (
    <div className="flex flex-col h-full">
      <AnalyticsCookieBanner />
      <div className="bg-dark">
        <nav className="container">
          <SearchBar />
        </nav>
        <div className={`gradient ${styles.searchBarBorder}`} />
      </div>
      <div className="flex-1">{children}</div>

      <Footer noMargin={noMarginFooter} className="mt-24 lg:mt-48 z-0" />
    </div>
  );
};

export default PageWrapper;
