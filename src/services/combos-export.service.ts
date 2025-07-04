import { Variant } from '@space-cow-media/spellbook-client';
import { getPrerequisiteList } from 'lib/prerequisitesProcessor';

const LINE_BREAK = '\n';

function getIdentity(combo: Variant): string {
  let identity = '';

  for (let color of combo.identity.split('')) {
    identity += '{' + color + '}';
  }

  return identity;
}

function exportToText(combos: Variant[]): string {
  if (!combos) {
    return '';
  }

  const lines: string[] = [];

  for (let indexCombo = 0; indexCombo < combos.length; indexCombo++) {
    const combo = combos[indexCombo];

    lines.push(`${indexCombo + 1}. --------------------------------------`);
    lines.push(getIdentity(combo));
    lines.push(LINE_BREAK);

    lines.push('Cards Required:');
    for (let comboCard of combo.uses) {
      lines.push(`- ${comboCard.card.name}`);
    }
    lines.push(LINE_BREAK);

    lines.push('Prerequisites:');
    const prerequisites = getPrerequisiteList(combo);
    for (let prereq of prerequisites) {
      lines.push(`- ${prereq.description}`);
    }
    lines.push(LINE_BREAK);

    lines.push('Steps:');
    const steps = combo.description.split(LINE_BREAK);

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      lines.push(`${stepIndex + 1}. ${steps[stepIndex]}`);
    }
    lines.push(LINE_BREAK);

    lines.push('Results:');
    for (let result of combo.produces) {
      lines.push(`- ${result.feature.name}`);
    }
  }

  return lines.join(LINE_BREAK);
}

const CombosExportService = {
  exportToText,
};

export default CombosExportService;
