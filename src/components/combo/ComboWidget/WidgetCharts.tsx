import React, { useEffect, useId, useRef, useState } from 'react';
import { BarChart as BarChartData, LineChart as LineChartData, formatNumber } from 'lib/comboWidgets/calculator';
import cn from 'lib/cn';
import styles from './comboWidget.module.scss';

const TONE_CLASSES = {
  good: styles.toneGood,
  bad: styles.toneBad,
  warn: styles.toneWarn,
  neutral: styles.toneNeutral,
};

interface BarChartProps {
  chart: BarChartData;
  onSelect: (key: string, value: number) => void;
}

/* Bars that set the input they sweep over, so they double as a quick picker. */
export const BarChart: React.FC<BarChartProps> = ({ chart, onSelect }) => {
  const titleId = useId();
  const max = chart.percent ? 100 : Math.max(1, ...chart.bars.map((bar) => bar.y));
  const shortValue = (y: number) => (chart.percent ? `${Math.round(y)}%` : formatNumber(y));
  return (
    <figure className={styles.chart}>
      <figcaption id={titleId} className={styles.chartTitle}>
        {chart.title}
      </figcaption>
      <div className={styles.bars} role="group" aria-labelledby={titleId}>
        {chart.bars.map((bar) => {
          const content = (
            <>
              <span className={styles.barValue} aria-hidden="true">
                {shortValue(bar.y)}
              </span>
              <span className={styles.barTrack} aria-hidden="true">
                <span
                  className={cn(styles.barFill, TONE_CLASSES[bar.tone ?? 'neutral'])}
                  style={{ height: `${Math.max(2, (bar.y / max) * 100)}%` }}
                />
              </span>
              <span className={styles.barLabel} aria-hidden="true">
                {bar.x}
              </span>
            </>
          );
          return chart.selects ? (
            <button
              key={bar.x}
              type="button"
              className={cn(styles.bar, bar.selected && styles.barSelected)}
              aria-pressed={!!bar.selected}
              aria-label={bar.label}
              onClick={() => onSelect(chart.selects!, Number(bar.x))}
            >
              {content}
            </button>
          ) : (
            <div key={bar.x} className={styles.bar} role="img" aria-label={bar.label}>
              {content}
            </div>
          );
        })}
      </div>
      <p className={styles.chartAxis}>{chart.xLabel}</p>
    </figure>
  );
};

const HEIGHT = 200;
const PADDING = { top: 14, right: 12, bottom: 26, left: 40 };

/* The width the element is drawn at, so the chart's text stays the size of the page's. */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceTicks(low: number, high: number, count: number): number[] {
  const span = Math.max(1, high - low);
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const ticks = [];
  for (let tick = Math.ceil(low / step) * step; tick <= high; tick += step) {
    ticks.push(Math.round(tick * 1000) / 1000);
  }
  return ticks;
}

export const LineChart: React.FC<{ chart: LineChartData }> = ({ chart }) => {
  const titleId = useId();
  const descriptionId = useId();
  const gradientId = useId();
  const [ref, width] = useWidth<HTMLDivElement>(600);
  const xs = chart.points.map((point) => point.x);
  const ys = [...chart.points.map((point) => point.y), ...(chart.marks ?? []).map((mark) => mark.y)];
  const xMin = Math.min(...xs);
  const xMax = Math.max(xMin + 1, ...xs);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(1, ...ys) * 1.05;
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const x = (value: number) => PADDING.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const y = (value: number) => PADDING.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;
  const line = chart.points
    .map((point, i) => `${i ? 'L' : 'M'}${x(point.x).toFixed(1)},${y(point.y).toFixed(1)}`)
    .join(' ');
  const area = `${line} L${x(chart.points[chart.points.length - 1].x).toFixed(1)},${y(yMin)} L${x(chart.points[0].x).toFixed(1)},${y(yMin)} Z`;
  const xTicks = niceTicks(xMin, xMax, Math.max(2, Math.floor(plotWidth / 70)));
  const yTicks = niceTicks(yMin, yMax, 4);

  return (
    <figure className={styles.chart}>
      <figcaption id={titleId} className={styles.chartTitle}>
        {chart.title}
      </figcaption>
      <div ref={ref} className={styles.lineChart}>
        <svg width={width} height={HEIGHT} role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className={styles.areaStart} />
              <stop offset="100%" className={styles.areaEnd} />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => (
            <g key={`y${tick}`}>
              <line
                className={styles.gridLine}
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className={styles.tickLabel}
                x={PADDING.left - 6}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatNumber(tick)}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text key={`x${tick}`} className={styles.tickLabel} x={x(tick)} y={HEIGHT - 8} textAnchor="middle">
              {formatNumber(tick)}
            </text>
          ))}
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} className={styles.linePath} />
          {(chart.marks ?? []).map((mark) => (
            <g key={mark.label} className={TONE_CLASSES[mark.tone ?? 'neutral']}>
              <line
                className={styles.markLine}
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y(mark.y)}
                y2={y(mark.y)}
              />
              <text className={styles.markLabel} x={width - PADDING.right - 4} y={y(mark.y) - 5} textAnchor="end">
                {mark.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className={styles.chartAxis}>{chart.xLabel}</p>
      <p id={descriptionId} className="sr-only">
        {chart.summary}
      </p>
    </figure>
  );
};
