import React, { useId } from 'react';
import ChartFigure from 'components/layout/ChartFigure/ChartFigure';
import { TONES } from 'components/ui/tones/tones';
import { type Point, areaPath, linePath } from 'lib/charts/paths';
import { niceTicks } from 'lib/charts/ticks';
import useElementWidth from 'lib/react/useElementWidth';
import type { Tone } from 'lib/tone';
import styles from './lineChart.module.scss';

interface Props {
  title: string;
  xLabel: string;
  yLabel: string;
  points: Point[];
  /* horizontal lines worth pointing out, like a target */
  marks?: { y: number; label: string; tone?: Tone }[];
  /* the curve in words, for whoever can't see it */
  summary: string;
  format?: (value: number) => string;
}

const HEIGHT = 220;
const TOP = 16;
const BOTTOM = 28;
const TICK_CHARACTER = 7;
const NARROWEST = 240;

const LineChart: React.FC<Props> = ({
  title,
  xLabel,
  yLabel,
  points,
  marks = [],
  summary,
  format = (value) => value.toLocaleString('en-US'),
}) => {
  const titleId = useId();
  const summaryId = useId();
  const [ref, measured] = useElementWidth<HTMLDivElement>(560);
  const width = Math.max(NARROWEST, measured);
  const drawn = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  const xMin = Math.min(...drawn.map((point) => point.x));
  const xMax = Math.max(xMin + 1, ...drawn.map((point) => point.x));
  const ys = [...drawn.map((point) => point.y), ...marks.map((mark) => mark.y)].filter(Number.isFinite);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(1, ...ys) * 1.05;
  const yTicks = niceTicks(yMin, yMax, 4);
  const left = 12 + Math.max(1, ...yTicks.map((tick) => format(tick).length)) * TICK_CHARACTER;
  const right = Math.max(16, (format(xMax).length * TICK_CHARACTER) / 2 + 4);
  const plotWidth = width - left - right;
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const x = (value: number) => left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const y = (value: number) => TOP + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;
  const xTicks = niceTicks(xMin, xMax, Math.max(2, Math.floor(plotWidth / 90)));
  const curve = drawn.map((point) => ({ x: x(point.x), y: y(point.y) }));

  return (
    <ChartFigure title={title} titleId={titleId} xLabel={xLabel} yLabel={yLabel}>
      <div ref={ref} className={styles.plot}>
        {drawn.length > 1 && (
          <svg
            className={styles.svg}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="img"
            aria-labelledby={titleId}
            aria-describedby={summaryId}
          >
            {yTicks.map((tick) => (
              <g key={`y${tick}`}>
                <line className={styles.grid} x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
                <text className={styles.tick} x={left - 6} y={y(tick)} textAnchor="end" dominantBaseline="middle">
                  {format(tick)}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <text key={`x${tick}`} className={styles.tick} x={x(tick)} y={HEIGHT - 8} textAnchor="middle">
                {format(tick)}
              </text>
            ))}
            <path className={styles.area} d={areaPath(curve, y(0))} />
            <path className={styles.line} d={linePath(curve)} pathLength={1} />
            {marks.map((mark) => (
              <g key={mark.label} className={TONES[mark.tone ?? 'neutral'].className}>
                <line className={styles.mark} x1={left} x2={width - right} y1={y(mark.y)} y2={y(mark.y)} />
                <text className={styles.markLabel} x={width - right - 4} y={y(mark.y) - 6} textAnchor="end">
                  {mark.label}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
      <p id={summaryId} className="sr-only">
        {summary}
      </p>
    </ChartFigure>
  );
};

export default LineChart;
