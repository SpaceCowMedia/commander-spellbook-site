import React from 'react';
import styles from './chartFigure.module.scss';

interface Props {
  title: string;
  /* for the plot to name itself after the title */
  titleId?: string;
  xLabel: string;
  yLabel?: string;
  /* a group of controls rather than a picture, when the plot has something to pick */
  pickable?: boolean;
  /* the plot */
  children: React.ReactNode;
}

/* What every chart has around its plot: a title, and what each axis measures. */
const ChartFigure: React.FC<Props> = ({ title, titleId, xLabel, yLabel, pickable, children }) => {
  const Frame = pickable ? 'fieldset' : 'figure';
  const Title = pickable ? 'legend' : 'figcaption';
  return (
    <Frame className={styles.chart}>
      <Title id={titleId} className={styles.title}>
        {title}
      </Title>
      {yLabel && (
        <p className={styles.axis} aria-hidden="true">
          {yLabel}
        </p>
      )}
      {children}
      <p className={styles.axis} aria-hidden="true">
        {xLabel}
      </p>
    </Frame>
  );
};

export default ChartFigure;
