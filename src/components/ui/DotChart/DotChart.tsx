import React, { useId } from 'react';
import ChartFigure from 'components/layout/ChartFigure/ChartFigure';
import Icon from 'components/ui/Icon/Icon';
import TextWithSuperscripts from 'components/ui/TextWithSuperscripts/TextWithSuperscripts';
import { TONES } from 'components/ui/tones/tones';
import { type Point, areaPath, linePath } from 'lib/charts/paths';
import { niceScale } from 'lib/charts/ticks';
import classNames from 'lib/react/classNames';
import type { Tone } from 'lib/tone';
import styles from './dotChart.module.scss';

interface Dot extends Point {
  /* what the dot says, in its tooltip and to assistive technology */
  label: React.ReactNode;
  tone?: Tone;
}

interface Props {
  title: string;
  xLabel: string;
  dots: Dot[];
  /* the answers just past the first and last dots, where the x goes on that way */
  before?: Point;
  after?: Point;
  /* the top of the scale, when it isn't the highest dot, like 100 for percentages */
  max?: number;
  format?: (y: number) => string;
  /* with both, picking a dot picks its x, so the chart doubles as a set of radio buttons */
  selected?: number;
  onSelect?: (x: number) => void;
  /* the x whose dot stands for every x from it on, ticked "5+" */
  orMore?: number;
}

const STEPS = 4;
/* dots higher up than this, in percent, show their tooltip below them, clear of the title */
const TIP_BELOW = 80;
/* ticks longer than this need wider columns */
const LONG_TICK = 3;
/* how far past the plot, in percent, a dashed end can aim */
const FAR = 1000;
/* how far above the plot's top, in percent, a dashed end stays in sight: within the room left there */
const OVERSHOOT = 15;

const DotChart: React.FC<Props> = ({
  title,
  xLabel,
  dots,
  before,
  after,
  max,
  format = (y) => y.toLocaleString('en-US'),
  selected,
  onSelect,
  orMore,
}) => {
  const name = useId();
  const clipId = useId();
  const n = dots.length;
  /* past a dot that stands for everything above it, the answer stays put */
  const onward = after ?? (n > 0 && dots[n - 1].x === orMore ? dots[n - 1] : undefined);
  /* the scale is the dots' own: the answers past the ends may lie beyond it */
  const ys = dots.map((dot) => dot.y).filter(Number.isFinite);
  const scale = niceScale(Math.min(0, ...ys), max ?? Math.max(0, ...ys), STEPS, ys.every(Number.isInteger) ? 1 : 0);
  const low = scale[0];
  const high = scale[scale.length - 1];
  /* how far up y sits, in percent of the plot's height, past the plot when the scale stops short of it */
  const reach = (y: number) => (Number.isNaN(y) ? 0 : Math.min(FAR, Math.max(-FAR, ((y - low) / (high - low)) * 100)));
  const at = (y: number) => Math.min(100, Math.max(0, reach(y)));
  const position = (y: number) => ({ '--at': `${at(y)}%` }) as React.CSSProperties;

  /* the plot is one unit wide per dot and 100 high, stretched to fit */
  const spots = dots.map((dot, i) => ({ x: i + 0.5, y: 100 - at(dot.y) }));
  /* the line stops halfway to the answers past the ends, or where it leaves the plot */
  const halfway = (y: number, next: Point) => 100 - (at(y) + reach(next.y)) / 2;
  const lead = before && n > 0 ? [{ x: 0, y: halfway(dots[0].y, before) }] : [];
  const trail = onward && n > 0 ? [{ x: n, y: halfway(dots[n - 1].y, onward) }] : [];
  const beyond = [...lead.map((end) => [spots[0], end]), ...trail.map((end) => [spots[n - 1], end])]
    .map(linePath)
    .join(' ');
  /* the area runs under the dashed ends too */
  const area = areaPath([...lead, ...spots, ...trail], 100 - at(0));

  const tick = (x: number) => `${x.toLocaleString('en-US')}${x === orMore ? '+' : ''}`;
  const widest = scale.map(format).reduce((wide, label) => (label.length > wide.length ? label : wide), '');
  /* tooltips open away from the nearer edge, so they stay inside the chart */
  const side = (i: number) => (i < (n - 1) / 3 ? styles.start : i > (2 * (n - 1)) / 3 ? styles.end : styles.middle);

  const content = (dot: Dot, i: number) => (
    <>
      <span className="sr-only">
        {dot.label}
        {dot.tone && TONES[dot.tone].word && `, ${TONES[dot.tone].word}`}
      </span>
      <span className={styles.cell} style={position(dot.y)} aria-hidden="true">
        <span className={styles.dot} />
        {dot.x === selected && (
          <span className={styles.value}>
            <TextWithSuperscripts text={format(dot.y)} />
          </span>
        )}
        <span className={classNames(styles.tip, side(i), at(dot.y) > TIP_BELOW && styles.below)}>{dot.label}</span>
      </span>
      <span className={styles.tickBox} aria-hidden="true">
        <span className={styles.tick}>{tick(dot.x)}</span>
      </span>
    </>
  );
  const columnProps = (dot: Dot) => ({
    className: classNames(
      styles.column,
      TONES[dot.tone ?? 'neutral'].className,
      onSelect && styles.pickable,
      dot.x === selected && styles.selected,
    ),
    'data-tone': dot.tone ?? 'neutral',
  });

  /* pointers can step past either end; keyboards have the radio buttons */
  const edge = (to: Point | undefined, end: 'before' | 'after') => {
    const icon = <Icon name={end === 'before' ? 'chevronLeft' : 'chevronRight'} />;
    return (
      to &&
      (onSelect ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={classNames(styles.more, styles[end])}
          onClick={() => onSelect(to.x)}
        >
          {icon}
        </button>
      ) : (
        <span aria-hidden="true" className={classNames(styles.more, styles[end])}>
          {icon}
        </span>
      ))
    );
  };

  const Columns = onSelect ? 'div' : 'ul';

  return (
    <ChartFigure title={title} xLabel={xLabel} pickable={Boolean(onSelect)}>
      <div className={classNames(styles.plot, dots.some((dot) => tick(dot.x).length > LONG_TICK) && styles.longTicks)}>
        <div className={styles.scale} aria-hidden="true">
          <span className={styles.widest}>
            <TextWithSuperscripts text={widest} />
          </span>
          {scale.map((value) => (
            <span key={value} className={styles.scaleTick} style={position(value)}>
              <TextWithSuperscripts text={format(value)} />
            </span>
          ))}
        </div>
        <div className={styles.frame}>
          <div className={styles.grid} aria-hidden="true">
            {scale.map((value) => (
              <span
                key={value}
                className={classNames(styles.gridLine, value === 0 && styles.baseline)}
                style={position(value)}
              />
            ))}
          </div>
          <svg
            className={styles.lines}
            viewBox={`0 0 ${Math.max(1, n)} 100`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <clipPath id={`${clipId}plot`}>
              <rect width={Math.max(1, n)} height={100} />
            </clipPath>
            <clipPath id={`${clipId}past`}>
              <rect y={-OVERSHOOT} width={Math.max(1, n)} height={100 + OVERSHOOT} />
            </clipPath>
            {area && <path className={styles.area} d={area} clipPath={`url(#${clipId}plot)`} />}
            {beyond && <path className={styles.beyond} d={beyond} clipPath={`url(#${clipId}past)`} />}
            {n > 1 && <path className={styles.line} d={linePath(spots)} />}
          </svg>
          <Columns className={styles.columns}>
            {dots.map((dot, i) =>
              onSelect ? (
                <label key={dot.x} {...columnProps(dot)}>
                  <input
                    type="radio"
                    className={styles.radio}
                    name={name}
                    value={dot.x}
                    checked={dot.x === selected}
                    onChange={() => onSelect(dot.x)}
                  />
                  {content(dot, i)}
                </label>
              ) : (
                <li key={dot.x} {...columnProps(dot)}>
                  {content(dot, i)}
                </li>
              ),
            )}
          </Columns>
          {edge(before, 'before')}
          {edge(after, 'after')}
        </div>
      </div>
    </ChartFigure>
  );
};

export default DotChart;
