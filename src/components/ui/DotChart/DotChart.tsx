import React, { useId, useState } from 'react';
import ChartFigure from 'components/layout/ChartFigure/ChartFigure';
import Icon from 'components/ui/Icon/Icon';
import TextWithSuperscripts from 'components/ui/TextWithSuperscripts/TextWithSuperscripts';
import { TONES } from 'components/ui/tones/tones';
import { type Point, areaPath, linePath } from 'lib/charts/paths';
import { niceScale } from 'lib/charts/ticks';
import classNames from 'lib/react/classNames';
import useSwipe from 'lib/react/useSwipe';
import type { Tone } from 'lib/tone';
import styles from './dotChart.module.scss';

interface Dot extends Point {
  /* what the dot says, in its tooltip and to assistive technology */
  label: React.ReactNode;
  tone?: Tone;
}

/* a line across the chart worth pointing out, like the life you can't go below */
interface Mark {
  y: number;
  label: string;
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
  marks?: Mark[];
  /* with both, the arrows past the ends turn to the pages of steps on either side */
  page?: number;
  onPage?: (page: number) => void;
}

/* what a page of the chart plots */
interface Sheet {
  dots: Dot[];
  before?: Point;
  after?: Point;
  marks: Mark[];
}

interface Turn {
  from: Sheet;
  to: number;
  forward: boolean;
}

const STEPS = 4;
/* dots higher up than this, in percent, show their tooltip below them, clear of the title */
const TIP_BELOW = 80;
/* ticks longer than this need wider columns */
const LONG_TICK = 3;
/* how far past the plot, in percent, a dashed end can aim */
const FAR = 100_000;
/* how far above the plot's top, in percent, a dashed end stays in sight: within the room left there */
const OVERSHOOT = 15;
/* the most a turn zooms the scale, as a natural logarithm: far past anything left in sight */
const ZOOM = 50;

/* The scale of a sheet's dots and marks: the answers past the ends may lie beyond it. Where a y sits on
   it, in percent of the plot's height, is past the plot when the scale stops short of it, or within it. */
function scaleOf({ dots, marks }: Sheet, max?: number) {
  const ys = [...dots, ...marks].map((point) => point.y).filter(Number.isFinite);
  const ticks = niceScale(Math.min(0, ...ys), max ?? Math.max(0, ...ys), STEPS, ys.every(Number.isInteger) ? 1 : 0);
  const low = ticks[0];
  const span = ticks[ticks.length - 1] - low;
  const reach = (y: number) => (Number.isNaN(y) ? 0 : Math.min(FAR, Math.max(-FAR, ((y - low) / span) * 100)));
  return { ticks, span, reach, at: (y: number) => Math.min(100, Math.max(0, reach(y))) };
}

type Scale = ReturnType<typeof scaleOf>;

/* While a page turns, both pages are drawn to one scale going from the old page's to the new one's,
   so the line runs on from one to the other: 0 glides between where each puts it, and the span zooms. */
const zoomFrom = (from: Scale, to: Scale) =>
  ({
    '--from-zero': from.at(0),
    '--to-zero': to.at(0),
    '--zoom': Math.max(-ZOOM, Math.min(ZOOM, Math.log(from.span) - Math.log(to.span))),
  }) as React.CSSProperties;

const position = (at: number) => ({ '--own': at }) as React.CSSProperties;

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
  marks = [],
  page = 0,
  onPage,
}) => {
  const name = useId();
  const clipId = useId();
  const [turn, setTurn] = useState<Turn>();
  const [turns, setTurns] = useState(0);
  const shown: Sheet = { dots, before, after, marks };
  const scale = scaleOf(shown, max);
  const turning = turn?.to === page ? turn : undefined;
  const from = turning && scaleOf(turning.from, max);
  /* the old page's ticks fade out where the zoom takes them, as the new page's own fade in */
  const ticks = [
    ...scale.ticks.map((value) => ({
      value,
      at: scale.at(value),
      className: from && !from.ticks.includes(value) && styles.entering,
    })),
    ...(from?.ticks
      .filter((value) => !scale.ticks.includes(value))
      .map((value) => ({ value, at: from.at(value), className: styles.leaving })) ?? []),
  ];

  const tick = (x: number) => `${x.toLocaleString('en-US')}${x === orMore ? '+' : ''}`;
  const widest = scale.ticks.map(format).reduce((wide, label) => (label.length > wide.length ? label : wide), '');

  const sheet = ({ dots, before, after }: Sheet, { at, reach }: Scale, clip: string, pickable: boolean) => {
    const n = dots.length;
    /* past a dot that stands for everything above it, the answer stays put */
    const onward = after ?? (n > 0 && dots[n - 1].x === orMore ? dots[n - 1] : undefined);
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
    /* tooltips open away from the nearer edge, so they stay inside the chart */
    const side = (i: number) => (i < (n - 1) / 3 ? styles.start : i > (2 * (n - 1)) / 3 ? styles.end : styles.middle);

    const content = (dot: Dot, i: number) => (
      <>
        <span className="sr-only">
          {dot.label}
          {dot.tone && TONES[dot.tone].word && `, ${TONES[dot.tone].word}`}
        </span>
        <span className={styles.cell} style={position(at(dot.y))} aria-hidden="true">
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
        pickable && styles.pickable,
        dot.x === selected && styles.selected,
      ),
      'data-tone': dot.tone ?? 'neutral',
    });
    const Columns = pickable ? 'div' : 'ul';

    return (
      <>
        <svg
          className={styles.lines}
          viewBox={`0 0 ${Math.max(1, n)} 100`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <clipPath id={`${clip}plot`}>
            <rect width={Math.max(1, n)} height={100} />
          </clipPath>
          <clipPath id={`${clip}past`}>
            <rect y={-OVERSHOOT} width={Math.max(1, n)} height={100 + OVERSHOOT} />
          </clipPath>
          {area && (
            <g clipPath={`url(#${clip}plot)`}>
              <path className={classNames(styles.area, styles.rescaled)} d={area} />
            </g>
          )}
          {beyond && (
            <g clipPath={`url(#${clip}past)`}>
              <path className={classNames(styles.beyond, styles.rescaled)} d={beyond} />
            </g>
          )}
          {n > 1 && <path className={classNames(styles.line, styles.rescaled)} d={linePath(spots)} />}
        </svg>
        <Columns className={styles.columns}>
          {dots.map((dot, i) =>
            pickable ? (
              <label key={dot.x} {...columnProps(dot)}>
                <input
                  type="radio"
                  className={styles.radio}
                  name={name}
                  value={dot.x}
                  checked={dot.x === selected}
                  onChange={() => onSelect?.(dot.x)}
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
      </>
    );
  };

  const turnTo = (forward: boolean) => {
    const to = page + (forward ? 1 : -1);
    setTurn({ from: shown, to, forward });
    setTurns((count) => count + 1);
    onPage?.(to);
  };
  /* on a touch screen the pages turn with a swipe too, the later steps coming from the right */
  const swipes = useSwipe((direction) => {
    const forward = direction === 'left';
    if (forward ? after : before) {
      turnTo(forward);
    }
  });

  /* pages of steps turn with the arrows; picks step past either end with pointers, keyboards having
     the radio buttons */
  const edge = (to: Point | undefined, end: 'before' | 'after') => {
    const icon = <Icon name={end === 'before' ? 'chevronLeft' : 'chevronRight'} />;
    return (
      to &&
      (onPage ? (
        <button
          type="button"
          aria-label={end === 'before' ? 'Earlier steps' : 'Later steps'}
          className={classNames(styles.more, styles.paging, styles[end])}
          onClick={() => turnTo(end === 'after')}
        >
          {icon}
        </button>
      ) : onSelect ? (
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

  return (
    <ChartFigure title={title} xLabel={xLabel} pickable={Boolean(onSelect)}>
      <div
        className={classNames(
          styles.plot,
          dots.some((dot) => tick(dot.x).length > LONG_TICK) && styles.longTicks,
          turning && styles.turning,
          turning && !turning.forward && styles.back,
          onPage && styles.swipes,
        )}
        style={from && zoomFrom(from, scale)}
        {...(onPage && swipes)}
      >
        {/* each turn starts its animations afresh, the arrows left alone */}
        <React.Fragment key={turns}>
          <div className={styles.scale} aria-hidden="true">
            <span className={styles.widest}>
              <TextWithSuperscripts text={widest} />
            </span>
            {ticks.map(({ value, at, className }) => (
              <span key={value} className={classNames(styles.scaleTick, className)} style={position(at)}>
                <TextWithSuperscripts text={format(value)} />
              </span>
            ))}
          </div>
          <div className={styles.frame}>
            <div className={styles.grid} aria-hidden="true">
              {ticks.map(({ value, at, className }) => (
                <span
                  key={value}
                  className={classNames(styles.gridLine, value === 0 && styles.baseline, className)}
                  style={position(at)}
                />
              ))}
              {marks.map((mark) => (
                <span
                  key={mark.label}
                  className={classNames(styles.mark, TONES[mark.tone ?? 'neutral'].className)}
                  style={position(scale.at(mark.y))}
                >
                  <span className={styles.markLabel}>{mark.label}</span>
                </span>
              ))}
            </div>
            <div className={styles.sheet}>{sheet(shown, scale, clipId, Boolean(onSelect))}</div>
            {turning && from && (
              <div
                className={classNames(styles.sheet, styles.leaving)}
                aria-hidden="true"
                inert
                onAnimationEnd={(event) => event.target === event.currentTarget && setTurn(undefined)}
              >
                {sheet(turning.from, from, `${clipId}leaving`, false)}
              </div>
            )}
          </div>
        </React.Fragment>
        {edge(before, 'before')}
        {edge(after, 'after')}
      </div>
      {marks.length > 0 && (
        <p className="sr-only">{marks.map((mark) => `${mark.label}: ${format(mark.y)}.`).join(' ')}</p>
      )}
    </ChartFigure>
  );
};

export default DotChart;
