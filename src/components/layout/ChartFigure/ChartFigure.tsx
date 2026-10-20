import React from 'react';
import styles from './chartFigure.module.scss';

interface Props {
  title: string;
  xLabel: string;
  /* a group of controls rather than a picture, when the plot has something to pick */
  pickable?: boolean;
  /* the plot */
  children: React.ReactNode;
}

/* What every chart has around its plot: a title, and what its steps along the bottom measure. */
const ChartFigure: React.FC<Props> = ({ title, xLabel, pickable, children }) => {
  const Frame = pickable ? 'fieldset' : 'figure';
  const Title = pickable ? 'legend' : 'figcaption';
  return (
    <Frame className={styles.chart}>
      <Title className={styles.title}>{title}</Title>
      {children}
      <p className={styles.axis} aria-hidden="true">
        {xLabel}
      </p>
    </Frame>
  );
};

export default ChartFigure;
