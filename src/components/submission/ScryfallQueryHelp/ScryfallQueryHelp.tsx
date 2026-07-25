import React from 'react';
import ExternalLink from '../../layout/ExternalLink/ExternalLink';

const VARIABLES = [
  'mv',
  'manavalue',
  'power',
  'pow',
  'toughness',
  'tou',
  'pt',
  'powtou',
  'loyalty',
  'loy',
  'c',
  'color',
  'id',
  'identity',
  'produces',
  'has',
  't',
  'type',
  'keyword',
  'kw',
  'is',
  'o',
  'oracle',
  'function',
  'otag',
  'oracletag',
  'oracleid',
  'm',
  'mana',
  'devotion',
];

const OPERATORS = ['=', '!=', '<', '>', '<=', '>=', ':'];

const Token: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="whitespace-nowrap rounded bg-gray-200 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
    {children}
  </code>
);

const ScryfallQueryHelp: React.FC = () => (
  <details className="mt-2 rounded-lg border border-gray-200 bg-gray-50 text-sm dark:border-gray-700 dark:bg-white/5">
    <summary className="cursor-pointer select-none px-3 py-2 font-bold">Supported query syntax</summary>
    <div className="space-y-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
      <p>
        Only a subset of Scryfall's search syntax is supported: the variables and operators listed below are the only
        ones accepted here.
      </p>
      <p className="flex flex-wrap items-center gap-1">
        <span className="font-bold">Variables:</span>
        {VARIABLES.map((variable) => (
          <Token key={variable}>{variable}</Token>
        ))}
      </p>
      <p className="flex flex-wrap items-center gap-1">
        <span className="font-bold">Operators:</span>
        {OPERATORS.map((operator) => (
          <Token key={operator}>{operator}</Token>
        ))}
      </p>
      <ul className="list-disc list-outside space-y-1 pl-5">
        <li>
          You can compose an <Token>and</Token>/<Token>or</Token> expression made of <Token>and</Token>/
          <Token>or</Token> expressions, like <Token>(c:W or c:U) and (t:creature or t:artifact)</Token>.
        </li>
        <li>
          You can also omit parentheses when not necessary, like <Token>(c:W or c:U) t:creature</Token>.
        </li>
        <li>
          Card names are only supported if wrapped in double quotes and preceded by an exclamation mark (
          <Token>!</Token>) in order to match the exact name, like <Token>!"Lightning Bolt"</Token>.
        </li>
        <li>
          You can negate any expression by prepending a dash (<Token>-</Token>), like <Token>-t:creature</Token>.
        </li>
      </ul>
      <p>
        More info on the full syntax at{' '}
        <ExternalLink href="https://scryfall.com/docs/syntax">scryfall.com/docs/syntax</ExternalLink>, keeping in mind
        that anything outside the list above will not be accepted.
      </p>
    </div>
  </details>
);

export default ScryfallQueryHelp;
