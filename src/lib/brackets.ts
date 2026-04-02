export const BRACKET_NAME_MAP = {
  R: 'Ruthless',
  S: 'Spicy',
  P: 'Powerful',
  O: 'Oddball',
  C: 'Core',
  E: 'Exhibition',
  B: 'Not Legal',
};

export const BRACKET_RANGE_MAP = {
  R: '4+',
  S: '3-4',
  P: '3',
  O: '2-3',
  C: '2',
  E: '1',
  B: 'N/A',
};

export const BRACKET_DESCRIPTION_MAP = {
  R: 'For competitive decks at brackets 4+',
  S: 'Probably 3 or 4, but hard to classify',
  P: 'For strong decks in bracket 3+',
  O: 'Probably 2 or 3, but hard to classify',
  C: 'For unoptimized decks in bracket 2+',
  E: 'For any deck',
  B: 'Not legal in any bracket',
};

export const BRACKET_CRITERIA_MAP = {
  R: 'Relevant two-card combo that is probably very fast or results in infinite turns or mass land denial or infinite control of opponents turns or contains four or more game changers',
  S: "Combos that could be ruthless but may require a third card or don't produce a relevant result, or stall the game in some way",
  P: 'Combos with a game changer or a slow but relevant two-card combo',
  O: "Combos that could be powerful but may require a third card or don't produce a relevant result",
  C: 'Combos that contains an extra turn card but no extra turn result, or a two-card combo too fast for bracket 1',
  E: "Combos that don't fit the other categories",
  B: 'Combos that are not legal in any bracket',
};
