import React from 'react';
import ArtCircle, { ArtCircleProps } from '../ArtCircle/ArtCircle';
import styles from './splashPage.module.scss';

type Props = {
  title: string;
  flavor: string;
  artCircleCardName: ArtCircleProps['cardName'];
  pulse?: boolean;
  children?: React.ReactNode;
};

const SplashPage: React.FC<Props> = ({ title, flavor, artCircleCardName, pulse = false, children }) => {
  return (
    <div className="w-full flex content-center justify-center text-center">
      <div className={`mb-auto mt-auto ${pulse && 'animate-pulse'}`}>
        <h3 className="heading-title">{title}</h3>
        <ArtCircle className="m-auto mt-4 mb-4" cardName={artCircleCardName} />
        {children}
        <div className={styles.flavorText}>
          <i>{flavor}</i>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
