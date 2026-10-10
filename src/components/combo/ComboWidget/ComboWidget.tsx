import React, { useId, useMemo } from 'react';
import Link from 'next/link';
import { Variant } from '@space-cow-media/spellbook-client';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import ChoiceField from 'components/ui/ChoiceField/ChoiceField';
import DotChart from 'components/ui/DotChart/DotChart';
import Icon from 'components/ui/Icon/Icon';
import LineChart from 'components/ui/LineChart/LineChart';
import NumberField from 'components/ui/NumberField/NumberField';
import { calculatorFor, detectWidget } from 'lib/combo/widgets';
import type { Calculator } from 'lib/combo/widgets/shared/calculator';
import { formatCompact, formatPercent } from 'lib/combo/widgets/shared/format';
import { CATEGORIES } from './categories';
import OpponentList from './OpponentList/OpponentList';
import ResultSummary from './ResultSummary/ResultSummary';
import StatList from './StatList/StatList';
import useWidgetValues from './useWidgetValues';
import styles from './comboWidget.module.scss';

const percent = (y: number) => formatPercent(y / 100);

interface PanelProps {
  widget: string;
  calculator: Calculator;
  comboId: string;
}

const Panel: React.FC<PanelProps> = ({ widget, calculator, comboId }) => {
  const { values, result, pristine, resets, setNumber, setChoice, setOpponents, reset } = useWidgetValues(calculator);
  const titleId = useId();
  const category = CATEGORIES[calculator.category];
  /* where a chart's answer stops changing, the input it selects stops too */
  const steadyFrom: Record<string, number | undefined> = Object.fromEntries(
    (result.charts ?? []).flatMap((chart) =>
      chart.kind === 'dots' && chart.selects && chart.steadyFrom !== undefined
        ? [[chart.selects, chart.steadyFrom]]
        : [],
    ),
  );
  const shown = (key: string) => Math.min(values.numbers[key], steadyFrom[key] ?? Infinity);
  return (
    <section className={styles.widget} aria-labelledby={titleId} data-widget={widget}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <span aria-hidden="true">
            <Icon name={category.icon} />
          </span>
          <span>
            {category.name}
            <span className={styles.kickerNoun}> calculator</span>
          </span>
        </p>
        <h3 id={titleId} className={styles.title}>
          <TextWithMagicSymbol text={calculator.title} />
        </h3>
        <p className={styles.summary}>
          <TextWithMagicSymbol text={calculator.summary} />
        </p>
      </header>

      <div className={styles.body}>
        {calculator.inputs.length > 0 && (
          <div className={styles.inputs}>
            {calculator.inputs.map((input) =>
              input.kind === 'number' ? (
                <NumberField
                  key={input.key}
                  label={input.label}
                  hint={input.hint}
                  value={shown(input.key)}
                  min={input.min}
                  max={steadyFrom[input.key] ?? input.max}
                  orMore={steadyFrom[input.key] !== undefined}
                  onChange={(value) => setNumber(input.key, value)}
                />
              ) : (
                <div key={input.key} className={styles.wide}>
                  <ChoiceField
                    label={input.label}
                    value={values.choices[input.key]}
                    options={input.options.map((option) => ({
                      value: option.value,
                      label: <TextWithMagicSymbol text={option.label} />,
                    }))}
                    onChange={(value) => setChoice(input.key, value)}
                  />
                </div>
              ),
            )}
          </div>
        )}

        {calculator.opponents && (
          <OpponentList
            key={resets}
            fields={calculator.opponents.fields}
            rows={values.opponents}
            outcomes={result.outcomes}
            onChange={setOpponents}
          />
        )}

        {/* after the inputs, so the keyboard reaches them first, though it shows in the corner */}
        <button
          type="button"
          className={styles.reset}
          aria-label="Reset the inputs"
          aria-disabled={pristine}
          onClick={pristine ? undefined : reset}
        >
          <Icon name="rotateLeft" />
          Reset
        </button>

        <ResultSummary result={result} />

        {result.stats && result.stats.length > 0 && <StatList stats={result.stats} />}

        {result.charts?.map((chart, i) =>
          chart.kind === 'dots' ? (
            <DotChart
              key={`dots${i}`}
              title={chart.title}
              xLabel={chart.xLabel}
              dots={chart.dots.map((dot) => ({ ...dot, label: <TextWithMagicSymbol text={dot.label} /> }))}
              before={chart.before}
              after={chart.after}
              max={chart.percent ? 100 : undefined}
              format={chart.percent ? percent : formatCompact}
              selected={chart.selects ? shown(chart.selects) : undefined}
              onSelect={chart.selects ? (x) => setNumber(chart.selects!, x) : undefined}
              orMore={chart.steadyFrom}
            />
          ) : (
            <LineChart
              key={`line${i}`}
              title={chart.title}
              xLabel={chart.xLabel}
              yLabel={chart.yLabel}
              points={chart.points}
              marks={chart.marks}
              summary={chart.summary}
              format={formatCompact}
            />
          ),
        )}
      </div>

      <footer className={styles.footer}>
        Worked out from this combo&apos;s steps and prerequisites.{' '}
        <Link href={`/submit-an-update/?comboId=${comboId}`}>Something off? Let us know.</Link>
      </footer>
    </section>
  );
};

interface Props {
  combo: Variant;
}

/* A calculator for the numbers a combo depends on at the table, when the combo has one. */
const ComboWidget: React.FC<Props> = ({ combo }) => {
  const spec = useMemo(() => detectWidget(combo), [combo]);
  const calculator = useMemo(() => spec && calculatorFor(spec), [spec]);
  return spec && calculator ? (
    <div id="combo-widget" className={styles.section}>
      <h2 className={styles.sectionTitle}>Widget</h2>
      <Panel key={`${combo.id}-${spec.widget}`} widget={spec.widget} calculator={calculator} comboId={combo.id} />
    </div>
  ) : null;
};

export default ComboWidget;
