import React from 'react';
import styles from './syntax-guide.module.scss';
import ArtCircle from '../components/layout/ArtCircle/ArtCircle';
import Link from 'next/link';
import SearchGuide from '../components/layout/SearchGuide/SearchGuide';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import SyntaxMarkdown from '../components/layout/SyntaxMarkdown/SyntaxMarkdown';
import Icon, { SpellbookIcon } from '../components/layout/Icon/Icon';

type SectionType = {
  id: string;
  text: string;
  icon: SpellbookIcon;
};

const DATA = {
  sections: [
    {
      id: 'cards',
      text: 'Cards',
      icon: 'signature',
    },
    {
      id: 'card-type',
      text: 'Card Type',
      icon: 'seedling',
    },
    {
      id: 'card-oracle-text',
      text: 'Card Oracle Text',
      icon: 'fileLines',
    },
    {
      id: 'card-keywords',
      text: 'Card Keywords',
      icon: 'key',
    },
    {
      id: 'card-mana-value',
      text: 'Card Mana Value',
      icon: 'coins',
    },
    {
      id: 'color-identity',
      text: 'Color Identity',
      icon: 'palette',
    },
    {
      id: 'prerequisites',
      text: 'Prerequisites',
      icon: 'listCheck',
    },
    {
      id: 'steps',
      text: 'Steps',
      icon: 'listOl',
    },
    {
      id: 'results',
      text: 'Results',
      icon: 'infinity',
    },
    {
      id: 'spellbook-id',
      text: 'Combo Identifier',
      icon: 'fingerprint',
    },
    {
      id: 'tags',
      text: 'Tags',
      icon: 'tags',
    },
    {
      id: 'commander',
      text: 'Commander',
      icon: 'commandZone',
    },
    {
      id: 'popularity',
      text: 'Popularity',
      icon: 'arrowUpRightDots',
    },
    {
      id: 'price',
      text: 'Price',
      icon: 'dollarSign',
    },
    {
      id: 'legality',
      text: 'Legality',
      icon: 'scaleBalanced',
    },
    {
      id: 'sort',
      text: 'Sort / Order',
      icon: 'arrowUpWideShort',
    },
  ] as SectionType[],
  cardSnippets: [
    {
      search: 'kenrith golem',
      description:
        'Combos that contain a card with the word kenrith in the name and a card with the word golem in the name',
    },
    {
      search: 'card:"breath of" -card:brudiclad',
      description:
        'Combos that contain a card with the phrase "breath of" in the name, but do not include any cards with the word brudiclad in the name',
    },
    {
      search: 'card="sydri, galvanic genius"',
      description: 'Combos that contain card with the exact name "sydri, galvanic genius"',
    },
    {
      search: 'cards>2 cards<=5',
      description: 'Combos that contain more than 2 cards but no greater than 5 cards',
    },
  ],
  cardTypeSnippets: [
    {
      search: 'type:land',
      description: 'Combos that contain a land card',
    },
    {
      search: '-t:creature -t:artifact',
      description: 'Combos that do not contain creature or artifact cards',
    },
  ],
  cardOracleTextSnippets: [
    {
      search: 'oracle:draw',
      description: 'Combos that contain a card with the word draw in the oracle text',
    },
    {
      search: 'text:"extra turn"',
      description: 'Combos that contain a card with the phrase "extra turn" in the oracle text',
    },
    {
      search: '-o:sacrifice',
      description: 'Combos that do not contain a card with the word sacrifice in the oracle text',
    },
  ],
  cardKeywordsSnippets: [
    {
      search: 'keyword:indestructible',
      description: 'Combos that contain a card with the keyword indestructible',
    },
    {
      search: '-keyword:partner',
      description: 'Combos that do not contain a card with the keyword partner',
    },
  ],
  cardManaValueSnippets: [
    {
      search: 'mv=0',
      description: 'Combos that contain a card with a mana value equal to 0',
    },
    {
      search: 'manavalue>10',
      description: 'Combos that contain a card with a mana value greater than 10',
    },
  ],
  colorIdentitySnippets: [
    {
      search: 'coloridentity:bug',
      description: 'Combos within the black, blue, green color identity.',
    },
    {
      search: 'ci=temur',
      description: 'Combos that have exactly the blue, green, red color identity.',
    },
    {
      search: 'c<3',
      description: 'Combos that have no more than 2 colors in their color identity.',
    },
    {
      search: 'colors=3 ids>=wb',
      description:
        'Combos that have exactly 3 colors in their color identity and 2 of those colors must be white and black.',
    },
  ],
  resultSnippets: [
    {
      search: 'result:infinite',
      description: 'Combos that include the word "infinite" in one of the results.',
    },
    {
      search: 'result:"win the game" -result:infinite',
      description:
        'Combos that include the phrase "win the game" and do not include the word "infinite" in any of the results.',
    },
    {
      search: 'result=3',
      description: 'Combos that include exactly 3 results.',
    },
  ],
  prerequisiteSnippets: [
    {
      search: 'prerequisite:mana',
      description: 'Combos that include the word "mana" in one of the prerequisites.',
    },
    {
      search: 'pre:"mana to cast it" -pre:permanent',
      description:
        'Combos that include the phrase "mana to cast it" in one of the prerequisites and no prerequisite with the word "permanent".',
    },
    {
      search: 'pre<=3',
      description: 'Combos that have no more than 3 prerequisites.',
    },
  ],
  stepSnippets: [
    {
      search: 'step:permanent',
      description: 'Combos that include the word "permanent" in one of the steps.',
    },
    {
      search: 'steps:"mill target opponent"',
      description: 'Combos that include the phrase "mill target opponent" in one of the steps.',
    },
    {
      search: 'steps>6',
      description: 'Combos that contain more than 6 steps.',
    },
  ],
  idSnippets: [
    {
      search: 'spellbookid:4131-4684',
      description: 'The combo for Basalt Monolith and Mesmeric Orb.',
    },
    {
      search: '-sid:4131-4684 card="Basalt Monolith" card="Mesmeric Orb"',
      description: 'Combos that contain the cards Basalt Monolith and Mesmeric Orb except for combo 4131-4684.',
    },
  ],
  tagSnippets: [
    {
      search: 'is:commander',
      description: 'Combos that require a commander.',
    },
    {
      search: 'is:featured',
      description: 'Combos that are featured on the home page.',
    },
  ],
  commanderSnippets: [
    {
      search: 'commander:codie',
      description: 'Combos that require Codie, Vociferous Codex to be your commander.',
    },
  ],
  popularitySnippets: [
    {
      search: 'popularity>1000',
      description: 'Combos that are in more than 1000 decks according to EDHREC.',
    },
    {
      search: 'decks<10',
      description: 'Combos that are in less than 10 decks according to EDHREC.',
    },
  ],
  priceSnippets: [
    {
      search: 'price<5',
      description: 'Combos where the entire price of the combo is less than $5.00 according to Card Kingdom.',
    },
    {
      search: 'tcgplayer>100',
      description: 'Combos where the entire price of the combo is greater than $100.00 according to TCGplayer.',
    },
    {
      search: 'cardmarket<=100',
      description:
        'Combos where the entire price of the combo is less than or equal to €100.00 according to Cardmarket.',
    },
  ],
  previewedSnippets: [
    {
      search: 'exclude:previewed',
      description: 'Exclude any combos that contain cards that are not legal in Commander (yet).',
    },
    {
      search: 'is:spoiled',
      description:
        'Combos that contain at least one card that is not yet legal in Commander. (may have no results, if there are no newly previewed cards)',
    },
  ],
  legalitySnippets: [
    {
      search: 'legal:vintage',
      description: 'Combos that are legal in Vintage.',
    },
    {
      search: '-legal:commander',
      description: 'Combos that contain at least one card that is banned in Commander.',
    },
  ],
  sortOrderSnippets: [],
};

const INTRODUCTION = `
You can use a variety of parameters to search the combo database.
No matter what parameter is used, capitalization will be disregarded, so a search of \`CARD:"BREATH OF" COLORIDENTITY:TEMUR RESULT:INFINITE\` is equivalent to \`card:"breath of" coloridentity:temur result:infinite\`.

> [!IMPORTANT]
> You can prefix a \`-\` to any search term to negate it, excluding all matching combos from the search result.
> For example, \`-card:" "\` will exclude all combos with a card whose name contains a space.
`;

const CARDS_DESCRIPTION = `
Type card names or parts of card names directly into the search bar to find combos that use those cards.
Writing a \`word\` in this way is equivalent to writing \`card:word\`.

> [!TIP]
> Accents and other diacritics are ignored; you can search for \`Deja Vu\` instead of \`Déjà Vu\`.

Put the card name inside double quotes (") to restrict the search to card names that include the entire phrase, including special characters and spaces.
For example, \`"Goblin King"\` will only find combos that contain the card Goblin King, while the search \`Goblin King\` without quotes will also find combos with both Goblin Bombardment and Darien, King of Kjeldor.
Writing \`"words with spaces"\` in this way is equivalent to writing \`card:"words with spaces"\`.

> [!TIP]
> Hyphens are also ignored, and can be removed or replaced by a single space.
> For example, \`card:"blade-blossom"\` is equivalent to \`card:"blade blossom"\` and \`card:"bladeblossom"\`

> [!TIP]
> Underscores are also ignored, and can be removed or replaced by a single space.
> For example, \`Fight the _____ Fight\` can be found with \`"Fight the _ Fight"\` or \`"Fight the Fight"\`

> [!WARNING]
> Single quotes are no longer supported in card search, since they can appear in card names.
> Instead, use double quotes. For example, \`"Goblin King"\` instead of \`'Goblin King'\`.
> Im the rare case where a card name contains double quotes, you can use the backslash character to escape them.
> For example, \`card:"Henzie \\"Toolbox\\" Torre"\`.

### \`card\` operators

* \`card:text\` searches for combos containing a card whose'name contains _text_
* \`card=text\` searches for combos containing a card named exactly _text_
* \`card<number\` searches for combos with less than _number_ cards
* \`card<=number\` searches for combos with less than or equal _number_ cards
* \`card>number\` searches for combos with more than _number_ cards
* \`card>=number\` searches for combos with at least _number_ cards
* \`card=number\` searches for combos with exactly _number_ cards

### \`card\` keyword aliases

* \`cards\`
`;

const CARD_TYPE_DESCRIPTION = `
You can search for combos that contain specific card types.
For example, \`cardtype:land\` searches for combos that contain at least one land.

> [!NOTE]
> Double-faced cards and split cards have their type line split by two slashes (\`//\`).
> For example, [Delver of Secrets](https://scryfall.com/search?q=!%22Delver%20of%20Secrets%22) has
> \`Creature — Human Wizard // Creature — Human Insect\` as its type line.

### \`cardtype\` operators

* \`cardtype:text\` searches for combos containing a card whose type line contains _text_
* \`cardtype=text\` searches for combos containing a card whose type line is exactly _text_

### \`cardtype\` keyword aliases

* \`type\`
* \`types\`
* \`t\`
`;

const CARD_ORACLE_TEXT_DESCRIPTION = `
You can search for combos that contain cards with specific oracle text.
For example, \`cardoracle:draw\` searches for combos that contain at least one card whose oracle text contains the word "draw".

> [!NOTE]
> Double-faced cards and split cards have their oracle texts concatenated.

### \`cardoracle\` operators

* \`cardoracle:text\` searches for combos containing a card whose oracle text contains _text_
* \`cardoracle=text\` searches for combos containing a card whose oracle text is exactly _text_

### \`cardoracle\` keyword aliases

* \`oracle\`
* \`text\`
* \`o\`
`;

const CARD_KEYWORDS_DESCRIPTION = `
You can search for combos that contain cards with specific keywords.
For example, \`cardkeywords:indestructible\` searches for combos that contain at least one card with the keyword "indestructible".

### \`cardkeywords\` operators

* \`cardkeywords:text\` searches for combos containing a card that has the keyword _text_

### \`cardkeywords\` keyword aliases

* \`cardkeyword\`
* \`keyword\`
* \`keywords\`
* \`kw\`
`;

const CARD_MANA_VALUE_DESCRIPTION = `
You can search for combos that contain cards with specific mana values.
For example, \`cardmanavalue>10\` searches for combos that contain at least one card with a mana value greater than 10.

### \`cardmanavalue\` operators

* \`cardmanavalue=number\` or \`cardmanavalue:number\` searches for combos containing a card with a mana value of _number_
* \`cardmanavalue>number\` searches for combos containing a card with a mana value greater than _number_
* \`cardmanavalue>=number\` searches for combos containing a card with a mana value greater than or equal to _number_
* \`cardmanavalue<number\` searches for combos containing a card with a mana value less than _number_
* \`cardmanavalue<=number\` searches for combos containing a card with a mana value less than or equal to _number_

### \`cardmanavalue\` keyword aliases

* \`manavalue\`
* \`mv\`
* \`cmc\`
`;

const COLOR_IDENTITY_DESCRIPTION = `
Each combo has a color identity determined by the color identities of its cards. This strictly follows Commander color identity rules.
By default, the color identity search finds all combos that a deck of that color identity could include. For example, \`coloridentity:bg\`
finds two-color black-green combos, but also monocolor black, monocolor green, and colorless combos.

The coloridentity parameter accepts full color names (such as \`green\`), single character abbreviations (\`w\`, \`u\`, \`b\`, \`r\`, \`g\`, and \`c\` for colorless),
and many color combination nicknames (\`boros\`, \`sultai\`, \`fivecolor\`, \`penta\`, etc.).

> [!NOTE]
> Color is not tracked separately from color identity. [Noble Hierarch](https://scryfall.com/search?q=!%22Noble%20Hierarch%22)
> is always green, white, and blue for the purpose of these searches.

### \`coloridentity\` operators

* \`coloridentity:text\` or \`coloridentity<=text\` search for combos within _text_ identity
* \`coloridentity=text\` searches for combos whose identity is exactly _text_
* \`coloridentity<text\` searches for combos within _text_ identity but excludes combos whose identity is exactly _text_
* \`coloridentity>=text\` searches for combos whose identity contains _text_
* \`coloridentity>text\` searches for combos whose identity contains _text_ but is not exactly _text_
* \`coloridentity=number\` searches for combos whose identity has exactly _number_ colors
* \`coloridentity>number\` searches for combos whose identity has more than _number_ colors
* \`coloridentity>=number\` searches for combos whose identity has _number_ or more colors
* \`coloridentity<number\` searches for combos whose identity has fewer than _number_ colors
* \`coloridentity<=number\` searches for combos whose identity has _number_ or fewer colors

### \`coloridentity\` keyword aliases

* \`color\`
* \`colors\`
* \`id\`
* \`identity\`
* \`ids\`
* \`c\`
* \`ci\`
`;

const PREREQUISITES_DESCRIPTION = `
A combo's prerequisites describe the game state required to start the combo.
For example, \`prerequisites:text\`, searches for _text_ in the prerequisites of combos.

> [!WARNING]
> In most cases, this will _not_ search the text of the following "basic" prerequisites found in almost every combo:
> * Mana available
> * Starting card locations
> * Some starting card states (especially those that appear in the same line as the starting location, such as "Clone on the battlefield as a copy of Kiki-Jiki")

### \`prerequisites\` operators

* \`prerequisites:text\` searches for combos that contain _text_ in their prerequisites
* \`prerequisites=text\` searches for combos that contain _text_ as their only prerequisite
* \`prerequisites=number\` searches for combos that contain exactly _number_ prerequisites
* \`prerequisites<number\` searches for combos that contain fewer than _number_ prerequisites
* \`prerequisites<=number\` searches for combos that contain _number_ or fewer prerequisites
* \`prerequisites>number\` searches for combos that contain more than _number_ prerequisites
* \`prerequisites>=number\` searches for combos that contain _number_ or more prerequisites

### \`prerequisites\` keyword aliases

* \`prerequisite\`
* \`prereq\`
* \`pre\`
`;

const STEPS_DESCRIPTION = `
Steps describe how to execute the combo.
For example, \`steps:text\` searches for _text_ in the Steps field.
Use double quotes if your search contains spaces (\`steps:"multiword text"\`).

### \`steps\` operators

* \`steps:text\` searches for combos that contain _text_ in their steps
* \`steps=text\` searches for combos that contain _text_ as their only step
* \`steps=number\` searches for combos that contain exactly _number_ steps
* \`steps<number\` searches for combos that contain fewer than _number_ steps
* \`steps<=number\` searches for combos that contain _number_ or fewer steps
* \`steps>number\` searches for combos that contain more than _number_ steps
* \`steps>=number\` searches for combos that contain _number_ or more steps

### \`steps\` keyword aliases

* \`step\`
* \`description\`
* \`desc\`
`;

const RESULTS_DESCRIPTION = `
Results are the effects that occur as a result of completing the combo.
For example, \`results:turns\` searches for combos that result in infinite or near-infinite turns.

### \`results\` operators

* \`results:text\` searches for combos that result in a feature whose name contains _text_
* \`results=text\` searches for combos that result in a feature whose name is exactly _text_
* \`results=number\` earches for combos that result in exactly _number_ features
* \`results<number\` searches for combos that result in fewer than _number_ features
* \`results<=number\` searches for combos that result in _number_ or fewer features
* \`results>number\` searches for combos that result in more than _number_ features
* \`results>=number\` searches for combos that result in _number_ or more features

## \`results\` keyword aliases

* \`result\`
`;

const SPELLBOOK_ID_DESCRIPTION = `
Commander Spellbook assigns a unique ID to each combo. Use \`spellbookid\` to search by this ID.
For example, \`spellbookid:2120-5329\` searches for a variant whose id is exactly _2120-5329_.

> [!TIP]
> The spellbook ID is a sequence of numbers and dashes found in each combo page's URL.
> You can change this portion of the URL to go directly to any combo page.


### \`spellbookid\` aliases

* \`sid\`
`;

const TAG_DESCRIPTION = `
Combos are tagged based on certain features.
You can search these using \`is:tag\`, which is the only alias and operator supported.

### Supported tags

Some tags are manually added to variants, meaning their support is always a work in progress.
Other tags are applied automatically, so their support is complete and always up-to-date.

#### Automatic tags

* \`preview\`/\`previewed\`/\`spoiler\`/\`spoiled\`: the combo contains an unreleased card
* \`commander\`: the combo requires you to have a commander, so it will not work in most non-Commander formats
* \`featured\`: the combo appears in the feature page, which usually displays combos using cards from a recent or upcoming set
* \`reserved\`: the combo contains at least one card from the Reserved List

#### Manual tags

The support for manual tags will be added in the future.

<!--
* \`lock\`: means that the variant locks your opponent
* \`infinite\`: means that the variant contains an infinite loop
* \`risky\`/\`allin\`: means that the variant steps have some chance to fail and result in a possible loss
* \`winning\`/\`win\`/\`gamewinning\`: means that the variant wins the game
-->
`;

const COMMANDER_DESCRIPTION = `
You can search for combos requiring a specific commander.
For example, \`commander:text\` searches for combos that require a commander whose name contains _text_.

### \`commander\` operators

* \`commander:text\` searches for combos that require a commander whose name contains _text_
* \`commander=text\` searches for combos that require a commander whose name is exactly _text_
`;

const POPULARITY_DESCRIPTION = `
You can filter and later sort combos by their popularity among EDHREC decklists.
The popularity value is the number of decks containing the combo, and is updated regularly.

For example, \`popularity>10000\` searches for combos that are present in more than 10000 decks.

### \`popularity\` operators

* \`popularity:number\` or \`popularity=number\` search for combos found in exactly \`number\` decks
* \`popularity>number\` searches for combos found in more than \`number\` decks
* \`popularity>=number\` searches for combos found in at least \`number\` decks
* \`popularity<number\` searches for combos found in fewer than \`number\` decks
* \`popularity<=number\` searches for combos found in at most \`number\` decks

### \`popularity\` keyword aliases

* \`pop\`
* \`deck\`
* \`decks\`
`;

const PRICE_DESCRIPTION = `
You can filter combos based on the total price of the cards it contains.
For example, \`price<number\` searches for combos costing less than _number_ US dollars, based on prices from CardKingdom.

> [!NOTE]
> This parameter only supports whole numbers.

### \`price\` operators

* \`price:number\` or \`price=number\` searches for combos whose price is exactly _number_
* \`price>number\` searches for combos that cost more than _number_
* \`price>=number\` searches for combos that cost at least _number_
* \`price<number\` searches for combos that cost less than _number_
* \`price<=number\` searches for combos that cost at most _number_

### \`price\` keyword aliases and supported stores

* \`usd\`/\`price\`/\`cardkingdom\`: [CardKingdom](https://www.cardkingdom.com/) prices in USD
* \`tcgplayer\`: [TCGPlayer](https://www.tcgplayer.com/) prices in USD
* \`eur\`/\`cardmarket\`: [Cardmarket](https://www.cardmarket.com/en/Magic) prices in Euros

For example, \`cardmarket>100\` searches for combos whose component cards cost more than 100€ in total on Cardmarket.
`;

const LEGALITY_DESCRIPTION = `
You can limit results to your preferred Magic format with the keyword \`legal\`.
For example, \`legality:format\` searches for combos legal in _format_.
On the other hand, \`banned:format\` searches for combos not legal in _format_
(either because of the format's banlist or its deck construction rules).

> [!NOTE]
> \`banned:format\` is equivalent to \`-legal:format\`.

### Supported formats

* \`commander\`
* \`pauper_commander\` (including combos that use up to one uncommon legendary creatures)
* \`pauper_commander_main\` (only commons)
* \`oathbreaker\`
* \`predh\`
* \`brawl\`
* \`vintage\`
* \`legacy\`
* \`modern\`
* \`pioneer\`
* \`standard\`
* \`pauper\`

> [!NOTE]
> Combos requiring a commander are automatically excluded if the legal filter is applied with a non-commander format.
> However, this search may return false results due to other format rules that it does not take into account, such as the number of players in a game.

### \`legal\` keyword aliases

* \`banned:format_name\`: same as \`-legal:format_name\`
* \`format:format_name\`: same as \`legal:format_name\`
`;

const SORT_ORDER_DESCRIPTION = `
> [!CAUTION]
> You can no longer sort results using the query syntax.
> Removing this feature allows to support more powerful search logic such as AND, OR, and parentheticals (will be added in the future).
> You can still sort results from the search results page, by selecting options from the drop-down menus.
`;

const SyntaxGuide: React.FC = () => {
  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Syntax Guide"
        description="Browse our search syntax for advanced EDH combo queries."
      />
      <div className={styles.syntaxGuideContainer}>
        <div className="container pt-6 mb-6">
          <ArtCircle cardName="Goblin Guide" className="m-auto md:block hidden" />
          <h1 className="heading-title">Syntax Guide</h1>
          <p className="text-center">A variety of parameters can be used to search for combos.</p>
        </div>

        <div className="border-b-2 border-gray-400 w-full">
          <div className="container pb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap">
              {DATA.sections.map((section) => (
                <Link key={section.id} href={`#${section.id}`} className="button flex-grow text-center md:w-1/4">
                  <div>
                    <Icon name={section.icon} /> {section.text}
                  </div>
                </Link>
              ))}
            </div>

            <SyntaxMarkdown>{INTRODUCTION}</SyntaxMarkdown>
          </div>
        </div>
        <div className={styles.searchGuideContainer}>
          <SearchGuide headingCardName="Peek" snippets={DATA.cardSnippets} heading="Cards" icon="signature">
            <SyntaxMarkdown>{CARDS_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            headingCardName="Mirror Entity"
            snippets={DATA.cardTypeSnippets}
            heading="Card Type"
            icon="seedling"
          >
            <SyntaxMarkdown>{CARD_TYPE_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            headingCardName="Alexander Clamilton"
            snippets={DATA.cardOracleTextSnippets}
            heading="Card Oracle Text"
            icon="fileLines"
          >
            <SyntaxMarkdown>{CARD_ORACLE_TEXT_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            headingCardName="Brazen Borrower"
            snippets={DATA.cardKeywordsSnippets}
            heading="Card Keywords"
            icon="key"
          >
            <SyntaxMarkdown>{CARD_KEYWORDS_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            headingCardName="Treasure"
            snippets={DATA.cardManaValueSnippets}
            heading="Card Mana Value"
            icon="coins"
          >
            <SyntaxMarkdown>{CARD_MANA_VALUE_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Color Identity"
            icon="palette"
            headingCardName="Fist of Suns"
            snippets={DATA.colorIdentitySnippets}
          >
            <SyntaxMarkdown>{COLOR_IDENTITY_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Prerequisites"
            icon="listCheck"
            headingCardName="Long-Term Plans"
            snippets={DATA.prerequisiteSnippets}
          >
            <SyntaxMarkdown>{PREREQUISITES_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide icon="listOl" heading="Steps" headingCardName="The Grand Calcutron" snippets={DATA.stepSnippets}>
            <SyntaxMarkdown>{STEPS_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            icon="infinity"
            heading="Results"
            headingCardName="Revel in Riches"
            snippets={DATA.resultSnippets}
          >
            <SyntaxMarkdown>{RESULTS_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Spellbook ID"
            icon="fingerprint"
            headingCardName="Fractured Identity"
            snippets={DATA.idSnippets}
          >
            <SyntaxMarkdown>{SPELLBOOK_ID_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide heading="Tags" icon="tags" headingCardName="Goblin Guide" snippets={DATA.tagSnippets}>
            <SyntaxMarkdown>{TAG_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Commander"
            icon="commandZone"
            headingCardName="Kenrith, the Returned King"
            snippets={DATA.commanderSnippets}
          >
            <SyntaxMarkdown>{COMMANDER_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Popularity"
            icon="arrowUpRightDots"
            headingCardName="Korvold, Fae-Cursed King"
            snippets={DATA.popularitySnippets}
          >
            <SyntaxMarkdown>{POPULARITY_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            icon="dollarSign"
            heading="Price"
            headingCardName="Smothering Tithe"
            snippets={DATA.priceSnippets}
          >
            <SyntaxMarkdown>{PRICE_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Legality"
            icon="scaleBalanced"
            headingCardName="Leovold, Emissary of Trest"
            snippets={DATA.legalitySnippets}
          >
            <SyntaxMarkdown>{LEGALITY_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            id="sort"
            heading="Sort / Order"
            icon="arrowUpWideShort"
            headingCardName="Brainstorm"
            snippets={DATA.sortOrderSnippets}
          >
            <SyntaxMarkdown>{SORT_ORDER_DESCRIPTION}</SyntaxMarkdown>
          </SearchGuide>
        </div>
      </div>
    </>
  );
};

export default SyntaxGuide;
