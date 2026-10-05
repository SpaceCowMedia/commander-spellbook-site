import React from 'react';
import { CardLegalities, VariantLegalities } from '@space-cow-media/spellbook-client';
import Icon from 'components/layout/Icon/Icon';
import styles from './legalityTable.module.scss';

interface Props {
  legalities: CardLegalities | VariantLegalities;
  className?: string;
}

const FORMATS: [keyof CardLegalities, string][] = [
  ['commander', 'Commander'],
  ['pauperCommander', 'Pauper Commander'],
  ['pauperCommanderMain', 'Pauper Commander in 99'],
  ['oathbreaker', 'Oathbreaker'],
  ['predh', 'PreDH'],
  ['alchemy', 'Alchemy'],
  ['standardBrawl', 'Standard Brawl'],
  ['brawl', 'Brawl'],
  ['competitiveBrawl', 'Competitive Brawl'],
  ['standard', 'Standard'],
  ['pioneer', 'Pioneer'],
  ['modern', 'Modern'],
  ['premodern', 'Premodern'],
  ['pauper', 'Pauper'],
  ['legacy', 'Legacy'],
  ['vintage', 'Vintage'],
];

function booleanToIcon(value: boolean) {
  return value ? <Icon name={'check'} className="text-green-500" /> : <Icon name={'cross'} className="text-red-500" />;
}

const LegalityTable: React.FC<Props> = ({ legalities, className }) => {
  return (
    <table className={`${styles.legalityTable} ${className ?? ''}`}>
      <thead>
        <tr>
          <th>Legality</th>
          <th>Format</th>
        </tr>
      </thead>
      <tbody>
        {FORMATS.map(([format, label]) => (
          <tr key={format}>
            <td>{booleanToIcon(legalities[format])}</td>
            <td>{label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LegalityTable;
