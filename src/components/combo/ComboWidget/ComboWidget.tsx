import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Variant } from '@space-cow-media/spellbook-client';
import Icon, { SpellbookIcon } from 'components/layout/Icon/Icon';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import { chooseComboWidget } from 'lib/comboWidgets/chooseComboWidget';
import { getCalculator } from 'lib/comboWidgets/calculators';
import {
  Calculator,
  OpponentField,
  Outcome,
  Result,
  Stat,
  Tone,
  Values,
  opponentName,
} from 'lib/comboWidgets/calculator';
import { WidgetKind } from 'lib/comboWidgets/spec';
import cn from 'lib/cn';
import { ChoiceField, NumberField, Stepper } from './WidgetInputs';
import { BarChart, LineChart } from './WidgetCharts';
import styles from './comboWidget.module.scss';

/* How each kind of widget introduces itself. */
const KINDS: Record<WidgetKind, { name: string; icon: SpellbookIcon }> = {
  'storm-life-loop': { name: 'Storm life loop', icon: 'bolt' },
  'storm-threshold': { name: 'Storm count', icon: 'forward' },
  'life-to-x': { name: 'Life into X', icon: 'wandSparkles' },
  'lethal-check': { name: 'Lethal check', icon: 'explosion' },
  'drain-loop': { name: 'Drain loop', icon: 'droplet' },
  'stat-scaled-cost': { name: 'Power and counters', icon: 'fist' },
  'count-scaled-cost': { name: 'Board size', icon: 'hashtag' },
  'finite-output': { name: 'Finite result', icon: 'trophy' },
  'opponent-count': { name: 'Table size', icon: 'masks' },
  'commander-tax': { name: 'Commander tax', icon: 'commandZone' },
  'random-chance': { name: 'Chance of success', icon: 'dice' },
};

const TONES: Record<Tone, { icon: SpellbookIcon; className: string }> = {
  good: { icon: 'complete', className: styles.toneGood },
  bad: { icon: 'circleXmark', className: styles.toneBad },
  warn: { icon: 'triangleExclamation', className: styles.toneWarn },
  neutral: { icon: 'circleInfo', className: styles.toneNeutral },
};

const MAX_OPPONENTS = 7;
const DEFAULT_OPPONENTS = 3;

function initialValues(calculator: Calculator): Values {
  const numbers: Record<string, number> = {};
  const choices: Record<string, string> = {};
  for (const input of calculator.inputs) {
    if (input.kind === 'number') {
      numbers[input.key] = input.initial;
    } else {
      choices[input.key] = input.initial;
    }
  }
  const opponent = () =>
    Object.fromEntries((calculator.opponents?.fields ?? []).map((field) => [field.key, field.initial]));
  const count = calculator.opponents ? (calculator.opponents.count ?? DEFAULT_OPPONENTS) : 0;
  return { numbers, choices, opponents: Array.from({ length: count }, opponent) };
}

const StatValue: React.FC<{ stat: Stat }> = ({ stat }) =>
  stat.mana ? <TextWithMagicSymbol text={stat.value} /> : <>{stat.value}</>;

const OutcomeBadge: React.FC<{ outcome: Outcome }> = ({ outcome }) => (
  <span className={cn(styles.outcome, TONES[outcome.tone].className)}>
    <Icon name={TONES[outcome.tone].icon} /> {outcome.text}
  </span>
);

interface OpponentsTableProps {
  fields: OpponentField[];
  rows: Record<string, number>[];
  outcomes?: Outcome[];
  onChange: (rows: Record<string, number>[]) => void;
}

const OpponentsTable: React.FC<OpponentsTableProps> = ({ fields, rows, outcomes, onChange }) => {
  const add = () => onChange([...rows, { ...rows[rows.length - 1] }]);
  const remove = (index: number) => onChange(rows.filter((_, i) => i !== index));
  const update = (index: number, key: string, value: number) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  return (
    <div className={styles.opponents}>
      <div className={styles.tableScroll}>
        <table className={styles.opponentsTable}>
          <caption className={styles.fieldLabel}>Opponents</caption>
          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Opponent
              </th>
              {fields.map((field) => (
                <th key={field.key} scope="col">
                  {field.label}
                </th>
              ))}
              {outcomes && <th scope="col">Result</th>}
              <th scope="col" className="sr-only">
                Remove
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <th scope="row" className={styles.opponentName}>
                  {opponentName(index)}
                </th>
                {fields.map((field) => (
                  <td key={field.key}>
                    <Stepper
                      id={`opponent-${index}-${field.key}`}
                      ariaLabel={`${opponentName(index)} ${field.label.toLowerCase()}`}
                      value={row[field.key]}
                      min={field.min}
                      max={field.max}
                      onChange={(value) => update(index, field.key, value)}
                      compact
                    />
                  </td>
                ))}
                {outcomes && <td>{outcomes[index] && <OutcomeBadge outcome={outcomes[index]} />}</td>}
                <td>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${opponentName(index).toLowerCase()}`}
                      onClick={() => remove(index)}
                    >
                      <Icon name="cross" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length < MAX_OPPONENTS && (
        <button type="button" className={styles.addButton} onClick={add}>
          <Icon name="plus" /> Add an opponent
        </button>
      )}
    </div>
  );
};

const ResultView: React.FC<{ result: Result }> = ({ result }) => (
  <div className={styles.result} role="status" aria-live="polite" aria-atomic="true">
    <div className={styles.headline}>
      <span className={styles.headlineLabel}>{result.headline.label}</span>
      <span className={styles.headlineValue}>
        <StatValue stat={result.headline} />
      </span>
      {result.headline.caption && <span className={styles.headlineCaption}>{result.headline.caption}</span>}
    </div>
    {result.verdict && (
      <div className={cn(styles.verdict, TONES[result.verdict.tone].className)}>
        <Icon name={TONES[result.verdict.tone].icon} className={styles.verdictIcon} />
        <div>
          <p className={styles.verdictTitle}>{result.verdict.title}</p>
          {result.verdict.detail && (
            <p className={styles.verdictDetail}>
              <TextWithMagicSymbol text={result.verdict.detail} />
            </p>
          )}
        </div>
      </div>
    )}
  </div>
);

interface Props {
  combo: Variant;
}

/* A calculator for the numbers a combo depends on at the table, when the combo has one. */
const ComboWidget: React.FC<Props> = ({ combo }) => {
  const spec = useMemo(() => chooseComboWidget(combo), [combo]);
  const calculator = useMemo(() => (spec ? getCalculator(spec) : undefined), [spec]);
  const [values, setValues] = useState<Values | undefined>(() => calculator && initialValues(calculator));
  const result = useMemo(() => (calculator && values ? calculator.compute(values) : undefined), [calculator, values]);

  if (!spec || !calculator || !values || !result) {
    return null;
  }

  const kind = KINDS[spec.widget];
  const setNumber = (key: string, value: number) =>
    setValues({ ...values, numbers: { ...values.numbers, [key]: value } });
  const setChoice = (key: string, value: string) =>
    setValues({ ...values, choices: { ...values.choices, [key]: value } });

  return (
    <section id="combo-widget" className={styles.widget} aria-labelledby="combo-widget-title" data-widget={spec.widget}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <Icon name={kind.icon} /> {kind.name} calculator
        </p>
        <h2 id="combo-widget-title" className={styles.title}>
          {calculator.title}
        </h2>
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
                  input={input}
                  value={values.numbers[input.key]}
                  onChange={(v) => setNumber(input.key, v)}
                />
              ) : (
                <ChoiceField
                  key={input.key}
                  input={input}
                  value={values.choices[input.key]}
                  onChange={(v) => setChoice(input.key, v)}
                />
              ),
            )}
          </div>
        )}

        {calculator.opponents && (
          <OpponentsTable
            fields={calculator.opponents.fields}
            rows={values.opponents}
            outcomes={result.outcomes}
            onChange={(opponents) => setValues({ ...values, opponents })}
          />
        )}

        <ResultView result={result} />

        {result.stats && result.stats.length > 0 && (
          <dl className={styles.stats}>
            {result.stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>
                  <StatValue stat={stat} />
                </dd>
                {stat.caption && <dd className={styles.statCaption}>{stat.caption}</dd>}
              </div>
            ))}
          </dl>
        )}

        {result.charts?.map((chart) =>
          chart.kind === 'bars' ? (
            <BarChart key={chart.title} chart={chart} onSelect={setNumber} />
          ) : (
            <LineChart key={chart.title} chart={chart} />
          ),
        )}

        {result.table && (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <caption className={styles.chartTitle}>{result.table.caption}</caption>
              <thead>
                <tr>
                  {result.table.columns.map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>
                        <TextWithMagicSymbol text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        Worked out from this combo&apos;s steps and prerequisites.{' '}
        <Link href={`/submit-an-update/?comboId=${combo.id}`}>Something off? Let us know</Link>
      </footer>
    </section>
  );
};

export default ComboWidget;
