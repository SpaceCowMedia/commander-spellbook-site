import { ComboWidgetSpec } from '../spec';
import { Calculator } from '../calculator';
import { drainLoopCalculator, stormLifeLoopCalculator } from './lifeLoop';
import { stormThresholdCalculator } from './stormThreshold';
import { lifeToXCalculator } from './lifeToX';
import { lethalCheckCalculator } from './lethalCheck';
import { scalingCalculator } from './scaling';
import { finiteOutputCalculator } from './finiteOutput';
import { randomChanceCalculator } from './randomChance';

export function getCalculator(spec: ComboWidgetSpec): Calculator {
  switch (spec.model) {
    case 'life-loop':
      return spec.widget === 'storm-life-loop' ? stormLifeLoopCalculator(spec) : drainLoopCalculator(spec);
    case 'storm-threshold':
      return stormThresholdCalculator(spec);
    case 'channel':
    case 'storm-herd-crusade':
    case 'storm-herd-count':
    case 'storm-herd-sunborn':
      return lifeToXCalculator(spec);
    case 'mana-formula':
    case 'threshold':
    case 'greven':
    case 'power-doubling':
    case 'krenko':
    case 'mill-each':
    case 'time-sieve':
    case 'devotion-times-opponents':
      return scalingCalculator(spec);
    case 'repercussion':
    case 'dragon-tempest':
    case 'onslaught':
    case 'token-growth':
    case 'mirrorform':
    case 'scepter-turns':
      return finiteOutputCalculator(spec);
    case 'dice-resource':
    case 'coin-flips':
    case 'krark':
      return randomChanceCalculator(spec);
    default:
      return lethalCheckCalculator(spec);
  }
}
