import type { Dot } from './shared/calculator';
import { stepDots, stepPage } from './shared/charts';
import { formatLog10, formatNumber, plural } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const SCUTES = numberInput('scutes', 'Scute Swarms you control', 1, { min: 1 });
const OTHERS = numberInput('others', 'Other creatures you can sacrifice', 1);
const LANDS = numberInput('lands', 'Lands you control', 5);
const LIBRARY_LANDS = numberInput('library', 'Lands with a basic land type in your library', 15);
/* from this many lands Scute Swarm copies itself instead of making an Insect */
const COPYING_LANDS = 6;
/* steps on a page of the chart: a sacrifice and a land for each loop */
const PAGE = 16;
/* below this many digits a count is worked out exactly */
const EXACT_DIGITS = 15;

export interface Board {
  scutes: number;
  others: number;
  lands: number;
  library: number;
}

/* After every land the library has: the Scute Swarms as a base-10 logarithm, since they soon outgrow
   any number, the other creatures left, and the lands fetched. Each loop sacrifices one of the other
   creatures while there are any, a Scute otherwise. Before six lands the Scutes only make Insects, a
   few loops at most; then they double while the others last, a loop each; then each loop takes them
   from x to 2(x − 1), which doubles the gap to 2. */
export function lastLand({ scutes, others, lands, library }: Board): { log10: number; others: number; loops: number } {
  let s = scutes;
  let o = others;
  let left = library;
  let loops = 0;
  for (let land = lands + 1; land < COPYING_LANDS && left > 0 && s + o > 0; land++) {
    if (o > 0) {
      o--;
    } else {
      s--;
    }
    o += s;
    left--;
    loops++;
  }
  if (left === 0 || s + o === 0) {
    return { log10: Math.log10(s), others: o, loops };
  }
  const spare = Math.min(o, left);
  o -= spare;
  left -= spare;
  loops += spare;
  let log10 = Math.log10(s) + (s > 0 ? spare * Math.log10(2) : 0);
  if (left === 0 || s === 0) {
    return { log10, others: o, loops };
  }
  if (log10 < EXACT_DIGITS) {
    const exact = s * 2 ** spare;
    if (exact === 1) {
      return { log10: -Infinity, others: o, loops: loops + 1 };
    }
    const gap = Math.log10(exact - 2) + left * Math.log10(2);
    log10 = exact === 2 ? Math.log10(2) : gap < EXACT_DIGITS ? Math.log10(2 ** left * (exact - 2) + 2) : gap;
  } else {
    log10 += left * Math.log10(2);
  }
  return { log10, others: o, loops: loops + left };
}

/* The creatures you can sacrifice for the first `steps` steps: down by one for each land fetched, up as
   the land makes every Scute Swarm add an Insect or a copy of itself, to the library's last land. */
export function stepByStep({ scutes, others, lands, library }: Board, steps = 1 + PAGE): Dot[] {
  const { dots, add } = stepDots();
  const board = (s: number, o: number) => `${plural(s, 'Scute Swarm')} and ${plural(o, 'other creature')}`;
  let s = scutes;
  let o = others;
  add(s + o, `To start: ${board(s, o)}`);
  for (let n = 0; n < library && s + o > 0 && dots.length < steps; n++) {
    const sacrificed = o > 0 ? 'another creature' : 'a Scute Swarm';
    if (o > 0) {
      o--;
    } else {
      s--;
    }
    add(s + o, `Sacrifice ${sacrificed} for a land: ${board(s, o)}`);
    const land = lands + n + 1;
    if (land >= COPYING_LANDS) {
      s *= 2;
      add(s + o, `Land ${formatNumber(land)}: each Scute Swarm copies itself, ${board(s, o)}`);
    } else {
      o += s;
      add(s + o, `Land ${formatNumber(land)}: each Scute Swarm makes an Insect, ${board(s, o)}`);
    }
  }
  return dots.slice(0, steps);
}

export const scuteSwarm = defineWidget('scute-swarm', {
  detect: (variant) => has(variant, 'Scute Swarm', 'Perilous Forays') && {},
  calculator: () => ({
    category: 'board',
    title: 'How many Scute Swarms by the last land?',
    summary: `Perilous Forays sacrifices a creature for each land with a basic land type you fetch, and each land makes every Scute Swarm add an Insect, or a copy of itself once you control ${COPYING_LANDS} lands. Sacrificing the other creatures first, the Scute Swarms double with every land until only they are left, and from then on still nearly double.`,
    inputs: [SCUTES, OTHERS, LANDS, LIBRARY_LANDS],
    compute(values) {
      const { scutes, others, lands, library } = values.numbers;
      const board = { scutes, others, lands, library };
      const last = lastLand(board);
      return {
        headline: {
          label: 'Scute Swarms',
          value: Number.isFinite(last.log10) ? formatLog10(last.log10) : '0',
          caption: `after ${plural(last.loops, 'land')}`,
        },
        stats: [{ label: 'Other creatures left', value: formatNumber(last.others) }],
        charts: [
          {
            title: 'Creatures, step by step',
            xLabel: 'Step',
            ...stepPage((steps) => stepByStep(board, steps), values.page ?? 0, PAGE),
          },
        ],
      };
    },
  }),
});
