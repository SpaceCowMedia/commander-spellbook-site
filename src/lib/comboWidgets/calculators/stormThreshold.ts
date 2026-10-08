import { StormThresholdSpec } from '../spec';
import { Calculator, Input, Result, formatNumber, numberInput, plural } from '../calculator';

function needed(spec: StormThresholdSpec, casts: number): number {
  if (spec.castDivisor) {
    return spec.base + Math.ceil(casts / spec.castDivisor);
  }
  return spec.base + (spec.perCast ?? 0) * casts;
}

export function stormThresholdCalculator(spec: StormThresholdSpec): Calculator {
  const counted = spec.counting === 'spells' ? 'spells' : 'instants and sorceries';
  const commander = spec.commander ?? 'your commander';
  const dependsOnCasts = spec.perCast !== undefined || spec.castDivisor !== undefined;
  const inputs: Input[] = [
    numberInput('storm', `${counted.charAt(0).toUpperCase()}${counted.slice(1)} you cast this turn`, 0, 60, 0),
  ];
  if (dependsOnCasts) {
    inputs.push(numberInput('casts', `Times ${commander} was cast from the command zone`, 0, 20, 0));
  }

  if (spec.capacity) {
    const capacity = spec.capacity;
    return {
      title: capacity.label,
      summary: `Grows by ${capacity.perSpell} for each of the ${counted} you've already cast this turn.`,
      inputs,
      compute(values): Result {
        const storm = values.numbers.storm;
        const value = capacity.base + capacity.perSpell * storm;
        return {
          headline: {
            label: capacity.label,
            value: formatNumber(value),
            caption: `with ${plural(storm, counted.replace(/s$/, ''), counted)} cast`,
          },
          charts: [
            {
              kind: 'bars',
              title: capacity.label,
              xLabel: `${counted} cast this turn`,
              yLabel: 'Colored mana',
              selects: 'storm',
              bars: Array.from({ length: 9 }, (_, n) => ({
                x: String(n),
                y: capacity.base + capacity.perSpell * n,
                label: `${n} cast: ${capacity.base + capacity.perSpell * n}`,
                selected: n === storm,
              })),
            },
          ],
        };
      },
    };
  }

  return {
    title: 'Does the loop keep going?',
    summary: dependsOnCasts
      ? `The loop needs a storm count of ${spec.base > 0 ? `${spec.base} plus ` : ''}${spec.castDivisor ? `the number of times ${commander} was cast, divided by ${spec.castDivisor} and rounded up` : `${spec.perCast === 1 ? 'one' : spec.perCast} for each time ${commander} was cast from the command zone`}.`
      : `The loop needs a storm count of at least ${spec.base}.`,
    inputs,
    compute(values): Result {
      const storm = values.numbers.storm;
      const casts = values.numbers.casts ?? 0;
      const need = needed(spec, casts);
      const missing = need - storm;
      return {
        headline: {
          label: 'Storm count needed',
          value: formatNumber(need),
          caption: dependsOnCasts ? `after ${plural(casts, 'cast')} of ${commander}` : undefined,
        },
        verdict:
          missing <= 0
            ? {
                tone: 'good',
                title: 'The loop keeps going',
                detail: missing < 0 ? `${plural(-missing, 'spell')} to spare.` : 'Exactly enough.',
              }
            : { tone: 'bad', title: `Cast ${plural(missing, 'more spell')} first` },
        charts: dependsOnCasts
          ? [
              {
                kind: 'bars',
                title: 'Storm count needed by command zone casts',
                xLabel: `Times ${commander} was cast`,
                yLabel: 'Storm count',
                selects: 'casts',
                bars: Array.from({ length: 9 }, (_, n) => ({
                  x: String(n),
                  y: needed(spec, n),
                  label: `${plural(n, 'cast')}: storm count ${needed(spec, n)}`,
                  tone: storm >= needed(spec, n) ? 'good' : 'bad',
                  selected: n === casts,
                })),
              },
            ]
          : undefined,
      };
    },
  };
}
