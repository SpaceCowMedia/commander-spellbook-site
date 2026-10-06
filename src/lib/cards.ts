import EDHRECService from 'services/edhrec.service';
import { ReplacementCard } from './types';

export interface CardReference {
  id?: number | null;
  oracleId?: string | null;
}

export interface SearchableCard {
  oracleId: string | null;
  name: string;
}

export function cardPath(card: CardReference): string | undefined {
  if (card.id) {
    return `/card/${card.id}/`;
  }
  if (card.oracleId) {
    return `/card/${card.oracleId}/`;
  }
  return undefined;
}

export function replacementCardUrl(card: ReplacementCard): string {
  return cardPath({ id: card.cardId, oracleId: card.oracleId }) ?? EDHRECService.getCardUrl(card.name);
}

// The backend matches no value containing an escaped double quote
export function quotedSearchValue(value: string): string | undefined {
  return value.includes('"') ? undefined : `"${value}"`;
}

export function cardSearchTerm(card: SearchableCard): string {
  const quotedName = quotedSearchValue(card.name);
  if (quotedName === undefined && card.oracleId) {
    return `cardoracleid=${card.oracleId}`;
  }
  return `card=${quotedName ?? JSON.stringify(card.name)}`;
}

export function commanderFormatTerm(legalInCommander: boolean): string {
  return legalInCommander ? 'legal:commander' : 'banned:commander';
}

export function cardComboQuery(card: SearchableCard, formatTerm: string, ...terms: string[]): string {
  return [cardSearchTerm(card), formatTerm, ...terms].join(' ');
}

export function searchPath(query: string, parameters: Record<string, string> = {}): string {
  return `/search/?${new URLSearchParams({ q: query, ...parameters })}`;
}

export function variantSearchPath(query: string, parameters: Record<string, string> = {}): string {
  return searchPath(query, { ...parameters, groupByCombo: 'false' });
}

export function submitComboPath(cardName: string): string {
  return `/submit-a-combo/?${new URLSearchParams({ card: cardName })}`;
}
