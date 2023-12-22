import React from "react";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import styles from "./syntax-guide.module.scss";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import Link from "next/link";
import SearchGuide from "../components/layout/SearchGuide/SearchGuide";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import Alert from "../components/layout/Alert/Alert";
import Markdown from "markdown-to-jsx";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import SyntaxMarkdown from "../components/layout/SyntaxMarkdown/SyntaxMarkdown";
import Icon, {SpellbookIcon} from "../components/layout/Icon/Icon";

type Props = {};


type SectionType = {
  id: string;
  text: string;
  icon: SpellbookIcon
}

const DATA = {
  sections: [
    {
      id: "cards",
      text: "Cards",
      icon: "signature"
    },
    {
      id: "color-identity",
      text: "Color Identity",
      icon: "palette",
    },
    {
      id: "prerequisites",
      text: "Prerequisites",
      icon: "listCheck"
    },
    {
      id: "steps",
      text: "Steps",
      icon: "listOl"
    },
    {
      id: "results",
      text: "Results",
      icon: "infinity"
    },
    {
      id: "spellbook-id",
      text: "Combo Identifier",
      icon: "fingerprint"
    },
    {
      id: "tags",
      text: "Tags",
      icon: "tags",
    },
    {
      id: "commander",
      text: "Commander",
      icon: "commandZone",
    },
    {
      id: "popularity",
      text: "Popularity",
      icon: "arrowUpRightDots",
    },
    {
      id: "price",
      text: "Price",
      icon: "dollarSign",
    },
    {
      id: "legality",
      text: "Legality",
      icon: "scaleBalanced"
    },
    {
      id: "sort",
      text: "Sort / Order",
      icon: "arrowUpWideShort",
    },
  ] as SectionType[],
  cardSnippets: [
    {
      search: "kenrith golem",
      description:
        "Combos that contain a card with the word kenrith in the name and a card with the word golem in the name",
    },
    {
      search: 'card:"breath of" -card:brudiclad',
      description:
        'Combos that contain a card with the phrase "breath of" in the name, but do not include any cards with the word brudiclad in the name',
    },
    {
      search: 'card="sydri, galvanic genius"',
      description:
        'Combos that contain card with the exact name "sydri, galvanic genius"',
    },
    {
      search: "cards>2 cards<=5",
      description:
        "Combos that contain more than 2 cards but no greater than 5 cards",
    },
  ],
  colorIdentitySnippets: [
    {
      search: "coloridentity:bug",
      description: "Combos within the black, blue, green color identity.",
    },
    {
      search: "ci=temur",
      description:
        "Combos that have exactly the blue, green, red color identity.",
    },
    {
      search: "c<3",
      description:
        "Combos that have no more than 2 colors in their color identity.",
    },
    {
      search: "colors=3 ids>=wb",
      description:
        "Combos that have exactly 3 colors in their color identity and 2 of those colors must be white and black.",
    },
  ],
  resultSnippets: [
    {
      search: "result:infinite",
      description:
        'Combos that include the word "infinite" in one of the results.',
    },
    {
      search: 'result:"win the game" -result:infinite',
      description:
        'Combos that include the phrase "win the game" and do not include the word "infinite" in any of the results.',
    },
    {
      search: "result=3",
      description: "Combos that include exactly 3 results.",
    },
  ],
  prerequisiteSnippets: [
    {
      search: "prerequisite:mana",
      description:
        'Combos that include the word "mana" in one of the prerequisites.',
    },
    {
      search: 'pre:"mana to cast it" -pre:permanent',
      description:
        'Combos that include the phrase "mana to cast it" in one of the prerequisites and no prerequisite with the word "permanent".',
    },
    // {
    //   search: "pre<=3",
    //   description: "Combos that have no more than 3 prerequisites.",
    // },
  ],
  stepSnippets: [
    {
      search: "step:permanent",
      description:
        'Combos that include the word "permanent" in one of the steps.',
    },
    {
      search: 'steps:"mill target opponent"',
      description:
        'Combos that include the phrase "mill target opponent" in one of the steps.',
    },
    // {
    //   search: "steps>6",
    //   description: "Combos that contain greater than 6 steps.",
    // },
  ],
  idSnippets: [
    {
      search: "spellbookid:4131-4684",
      description: "The combo for Basalt Monolith and Mesmeric Orb.",
    },
    {
      search: '-sid:4131-4684 card="Basalt Monolith" card="Mesmeric Orb"',
      description:
        "Combos that contain the cards Basalt Monolith and Mesmeric Orb except for combo 4131-4684.",
    },
  ],
  tagSnippets: [
    {
      search: "is:commander",
      description: "Combos that require a commander.",
    },
    {
      search: "is:featured",
      description: "Combos that are featured on the home page.",
    }
  ],
  commanderSnippets: [
    {
      search: "commander:codie",
      description: "Combos that require Codie, Vociferous Codex to be your commander.",
    }

  ],
  popularitySnippets: [
    {
      search: "popularity>1000",
      description:
        "Combos that are in more than 1000 decks according to EDHREC.",
    },
    {
      search: "decks<10",
      description: "Combos that are in less than 10 decks according to EDHREC.",
    },
  ],
  priceSnippets: [
    {
      search: "price<5",
      description:
        "Combos where the entire price of the combo is less than $5.00 according to Card Kingdom.",
    },
    {
      search: "tcgplayer>100",
      description:
        "Combos where the entire price of the combo is greater than $100.00 according to TCGplayer.",
    },
    {
      search: "cardmarket<=100",
      description:
        "Combos where the entire price of the combo is less than or equal to €100.00 according to Cardmarket.",
    },
  ],
  previewedSnippets: [
    {
      search: "exclude:previewed",
      description:
        "Exclude any combos that contain cards that are not legal in Commander (yet).",
    },
    {
      search: "is:spoiled",
      description:
        "Combos that contain at least one card that is not yet legal in Commander. (may have no results, if there are no newly previewed cards)",
    },
  ],
  legalitySnippets: [
    {
      search: "legal:vintage",
      description:
        "Combos that are legal in Vintage.",
    },
    {
      search: "-legal:commander",
      description:
        "Combos that contain at least one card that is banned in Commander.",
    },
  ],
  sortOrderSnippets: [],
};

const INTRODUCTION = `
A variety of parameters can be used to search for combos.
No matter what parameter is used, capitalization will be disregarded, so a search of \`CARD:"BREATH OF" COLORIDENTITY:TEMUR RESULT:INFINITE\` is equivalent to \`card:"breath of" coloridentity:temur result:infinite\`.

> [!IMPORTANT]
> You can prefix a \`-\` to any search term to negate it, resulting in the exclusion of matching variants from the search.
> For example, \`-card:" "\` will exclude all variants with a card whose name contains a space.
`

const CARDS_DESCRIPTION = `
You can find cards in a combo simply by entering the card names, or parts of the card names, into the search bar.
Passing multiple card names will result in combos that have cards that contain those words among the names of the cards in the combo.
Writing a \`word\` in this way is equivalent to writing \`card:word\`.

> [!TIP]
> Accents can be ignored, meaning that using \`a\` instead of \`à\` is supported.

You can lookup longer names for cards with double (") quotes.
This will find combos that contain cards with names that include the whole phrase, including special characters and space.
For instance, \`card:"Thassa's"\`, will include combos that contain a card whose name contains \`Thassa's\`, such as \`Thassa's Oracle\`.
Writing \`"words with spaces"\` in this way is equivalent to writing \`card:"words with spaces"\`.

> [!TIP]
> Additionally, hyphens are ignored too, and can be replaced either by nothing or by a single space.
> For example, \`card:"blade-blossom"\` is equivalent to \`card:"blade blossom"\` and \`card:"bladeblossom"\`

> [!WARNING]
> Using single quotes instead of double quotes is not supported anymore in card search, because single quotes can appear in card names.

### \`card\` operators

* \`card:text\` searches for variants containing a card whose'name contains _text_
* \`card=text\` searches for variants containing a card named exactly _text_
* \`card<number\` searches for variants with less than _number_ cards
* \`card<=number\` searches for variants with less than or equal _number_ cards
* \`card>number\` searches for variants with more than _number_ cards
* \`card>=number\` searches for variants with at least _number_ cards
* \`card=number\` searches for variants with exactly _number_ cards

### \`card\` keyword aliases

* \`cards\`
`

const COLOR_IDENTITY_DESCRIPTION = `
The color identity of a combo determines what colors the combo is comprised of.
The most basic search is in the form \`coloridentity:bug\`, which in this example finds all the combos that can be played within a green, blue, black color identity.
The coloridentity parameter accepts full color names like  green or the single character representations of the colors (w, u, b, r,  g).
You can use the names for color combinations such as  boros, izzet, naya,  sultai, colorless, fivecolor, penta, etc.

### \`coloridentity\` operators

* \`coloridentity:text\` or \`coloridentity<=text\` search for variants within _text_ identity
* \`coloridentity=text\` searches for variants whose identity is exactly \`text\`
* \`coloridentity<text\` searches for variants within _text_ identity but excludes variants whose identity is exactly \`text\`
* \`coloridentity>=text\` searches for variants whose identity contains _text_
* \`coloridentity>text\` searches for variants whose identity contains _text_ but excludes variants whose identity is exactly \`text\`
* \`coloridentity=number\` searches for variants whose identity is of exactly \`number\` colors
* \`coloridentity<number\` searches for variants whose identity is of more than \`number\` colors
* \`coloridentity<=number\` searches for variants whose identity is of at least \`number\` colors
* \`coloridentity<number\` searches for variants whose identity is of less than \`number\` colors
* \`coloridentity<=number\` searches for variants whose identity is of less than or equal \`number\` colors

### \`coloridentity\` keyword aliases

* \`color_identity\`
* \`color\`
* \`colors\`
* \`id\`
* \`ids\`
* \`c\`
* \`ci\`
`

const PREREQUISITES_DESCRIPTION = `
The prerequisites are the elements that need to be in place before the combo can be initiated.
The only supported operator is \`prerequisites:text\` which searches for _text_ in the "other prerequisites" section of a variant prerequisites, meaning it doesn't work for variant starting locations or initial state, nor mana needed.

> [!WARNING]
> The support for matching the mana needed, starting locations and starting card state has been dropped.

### \`prerequisites\` keyword aliases

* \`prerequisite\`
* \`prereq\`
* \`pre\`
`

const STEPS_DESCRIPTION = `
The steps are the elements that need to be followed to execute the combo.
The only supported operator is \`steps:text\` which searches for _text_ in the description of a variant.

### \`steps\` keyword aliases

* \`step\`
* \`description\`
* \`desc\`

> [!WARNING]
> numeric operators support has been dropped.
`

const RESULTS_DESCRIPTION = `
The results are the effects that occur as a result of completing the combo.
For example, \`results:infinite\` searches for variants that result in something infinite.

### \`results\` operators

* \`results:text\` searches for variants that result in a feature whose name contains _text_
* \`results=text\` searches for variants that result in a feature whose name is exactly _text_
* \`results=number\` searches for variants that result in a number of features equal to _number_
* \`results<number\` searches for variants that result in a number of features less than _number_
* \`results<=number\` searches for variants that result in a number of features less than or equal to _number_
* \`results>number\` searches for variants that result in a number of features greater than _number_
* \`results>=number\` searches for variants that result in a number of features greater than or equal to _number_

## \`results\` keyword aliases

* \`result\`
`

const SPELLBOOK_ID_DESCRIPTION = `
You can also search by spellbookid if you want to find a specific combo by its id.
Note that this can also be achieved by manipulating the variant detail page URL at the top of your browser window.

For example, \`spellbookid:1400-1401\` searches for a variant whose id is \`1400-1401\`.

### \`spellbookid\` aliases

* \`sid\`
`

const TAG_DESCRIPTION = `
Variants are automatically tagged based on their features.
You can find variants matching a tag called \`tag\` with \`is:tag\`, which is the only alias and operator supported.

### Supported tags

Tags are in some cases manually added to variants, meaning their support is always a work in progress.
Otherwise, they are called "automatic" and their support is complete and always up-to-date.

#### Automatic tags

* \`preview\`/\`previewed\`/\`spoiler\`/\`spoiled\`: means that a variant contains an unreleased, spoiled card
* \`commander\`: means that the variant can only work in commander because it requires a specific commander
* \`featured\`: means that the variant appears in the feature page (usually variants from recent sets are semi-automatically put there)

<!-- #### Manual tags (WIP)

* \`lock\`: means that the variant locks your opponent
* \`infinite\`: means that the variant contains an infinite loop
* \`risky\`/\`allin\`: means that the variant steps have some chance to fail and result in a possible loss
* \`winning\`/\`win\`/\`gamewinning\`: means that the variant wins the game -->
`

const COMMANDER_DESCRIPTION = `
You can search for variants requiring a specific commander.
For example, \`commander:text\` searches for variants that require a commander whose name contains _text_.
This keyword has no aliases.

### \`commander\` operators

* \`commander:text\` searches for variants that require a commander whose name contains _text_
* \`commander=text\` searches for variants that require a commander whose name is exactly _text_
`

const POPULARITY_DESCRIPTION = `
You can filter and later sort variants by their popularity inside EDHREC decklists.
The popularity value is the number of decks in which the variant is present, updated regularly.

For example, \`popularity>10000\` searches for variants that are present in more than 10000 decks.

### \`popularity\` operators

* \`popularity:number\` or \`popularity=number\` search for variants whose popularity is exactly \`number\`
* \`popularity>number\` searches for variants whose popularity is more than \`number\`
* \`popularity>=number\` searches for variants whose popularity is at least \`number\`
* \`popularity<number\` searches for variants whose popularity is less than \`number\`
* \`popularity<=number\` searches for variants whose popularity is less than or equal to \`number\`

### \`popularity\` keyword aliases

* \`pop\`
* \`deck\`
* \`decks\`
`

const PRICE_DESCRIPTION = `
You can search for variant whose cards priced sum to some value.
For example, \`price<number\` searches for variants costing less than _number_ dollars, based on prices from CardKingdom.

> [!NOTE]
> This parameter only supports whole numbers.

### \`price\` operators

* \`price:number\` or \`price=number\` searches for variants whose price is exactly _number_
* \`price>number\` searches for variants that cost more than _number_
* \`price>=number\` searches for variants that cost at least _number_
* \`price<number\` searches for variants that cost less than _number_
* \`price<=number\` searches for variants that cost less than or equal to _number_

### \`price\` keyword aliases and supported stores

* \`usd\`/\`price\`/\`cardkingdom\`: [CardKingdom](https://www.cardkingdom.com/)
* \`tcgplayer\`: [TCGPlayer](https://www.tcgplayer.com/)
* \`eur\`/\`cardmarket\`: [Cardmarket](https://www.cardmarket.com/en/Magic)

For example, \`cardmarket>100\` searches for variants that cost more than 100€ on Cardmarket (by adding the cards' single prices).
`

const LEGALITY_DESCRIPTION = `
Variants can be used in many different formats. You can filter for your preferred Magic format with the keyword \`legal\`.
For example, \`legality:format\` searches for variants legal in _format_.
On the contrary, \`banned:format\` searches for variants not legal in _format_. It's equivalent to \`-legal:format\`.

### Supported formats

* \`commander\`
* \`pauper_commander\` (including variants that use uncommon legendary creatures)
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
> Currently, variants requiring a commander are automatically excluded if the legal filter is applied with a non-commander format.

### \`legal\` keyword aliases

* \`banned:format_name\`: same as \`-legal:format_name\`
* \`format:format_name\`: same as \`legal:format_name\`
`

const SORT_ORDER_DESCRIPTION = `
> [!CAUTION]
> Sorting and ordering can't be done with the query syntax anymore.
> The reason being that every other keyword represents a filter, while sort doesn't. This blocks the way of supporting AND/OR + parenthesis logic, because sorting can't be logically combined with the rest of the filters.
> Sorting criteria will be selected by the user AFTER inputing the query, just like it's done in [Scryfall search](https://scryfall.com/search?as=grid&extras=true&lang=any&order=name&q=&unique=cards).
`

const SyntaxGuide: React.FC<Props> = ({}: Props) => {
  return (
    <PageWrapper>
      <SpellbookHead
        title="Commander Spellbook: Syntax Guide"
        description="Browse our search syntax for advanced EDH combo queries."
      />
      <div className={styles.syntaxGuideContainer}>
        <div className="container pt-6 mb-6">
          <ArtCircle
            cardName="Goblin Guide"
            className="m-auto md:block hidden"
          />
          <h1 className="heading-title">Syntax Guide</h1>
          <p className="text-center">
            A variety of parameters can be used to search for combos.
          </p>
        </div>

        <div className="border-b-2 border-gray-400 w-full">
          <div className="container pb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap">
              {DATA.sections.map((section) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="button flex-grow text-center md:w-1/4"
                >
                  <div><Icon name={section.icon} /> {section.text}</div>
                </Link>
              ))}
            </div>

            <SyntaxMarkdown>
              {INTRODUCTION}
            </SyntaxMarkdown>
          </div>
        </div>
        <div className={styles.searchGuideContainer}>
          <SearchGuide
            headingCardName="Peek"
            snippets={DATA.cardSnippets}
            heading="Cards"
            icon="signature"
          >
            <SyntaxMarkdown>
              {CARDS_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Color Identity"
            icon="palette"
            headingCardName="Fist of Suns"
            snippets={DATA.colorIdentitySnippets}
          >
            <SyntaxMarkdown>
              {COLOR_IDENTITY_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Prerequisites"
            icon="listCheck"
            headingCardName="Long-Term Plans"
            snippets={DATA.prerequisiteSnippets}
          >
            <SyntaxMarkdown>
              {PREREQUISITES_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            icon="listOl"
            heading="Steps"
            headingCardName="The Grand Calcutron"
            snippets={DATA.stepSnippets}
          >
            <SyntaxMarkdown>
              {STEPS_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            icon="infinity"
            heading="Results"
            headingCardName="Revel in Riches"
            snippets={DATA.resultSnippets}
          >
            <SyntaxMarkdown>
              {RESULTS_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Spellbook ID"
            icon="fingerprint"
            headingCardName="Fractured Identity"
            snippets={DATA.idSnippets}
          >
            <SyntaxMarkdown>
              {SPELLBOOK_ID_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Tags"
            icon="tags"
            headingCardName="Goblin Guide"
            snippets={DATA.tagSnippets}
            >
            <SyntaxMarkdown>
              {TAG_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Commander"
            icon="commandZone"
            headingCardName="Kenrith, the Returned King"
            snippets={DATA.commanderSnippets}
          >
            <SyntaxMarkdown>
              {COMMANDER_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Popularity"
            icon="arrowUpRightDots"
            headingCardName="Korvold, Fae-Cursed King"
            snippets={DATA.popularitySnippets}
          >
            <SyntaxMarkdown>
              {POPULARITY_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            icon="dollarSign"
            heading="Price"
            headingCardName="Smothering Tithe"
            snippets={DATA.priceSnippets}
          >
            <SyntaxMarkdown>
              {PRICE_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            heading="Legality"
            icon="scaleBalanced"
            headingCardName="Leovold, Emissary of Trest"
            snippets={DATA.legalitySnippets}
          >
            <SyntaxMarkdown>
              {LEGALITY_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>

          <SearchGuide
            id="sort"
            heading="Sort / Order"
            icon="arrowUpWideShort"
            headingCardName="Brainstorm"
            snippets={DATA.sortOrderSnippets}
          >
            <SyntaxMarkdown>
              {SORT_ORDER_DESCRIPTION}
            </SyntaxMarkdown>
          </SearchGuide>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SyntaxGuide;
