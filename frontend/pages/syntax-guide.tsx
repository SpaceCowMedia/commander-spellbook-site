import React from "react"
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import styles from './syntax-guide.module.scss'
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import Link from "next/link";
import SearchGuide from "../components/layout/SearchGuide/SearchGuide";
import ExternalLink from "../components/layout/ExternalLink/ExternalLink";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";

type Props = {}

const DATA = {
  sections: [
    {
      id: "cards",
      text: "Cards",
    },
    {
      id: "color-identity",
      text: "Color Identity",
    },
    {
      id: "prerequisites",
      text: "Prerequisites",
    },
    {
      id: "steps",
      text: "Steps",
    },
    {
      id: "results",
      text: "Results",
    },
    {
      id: "spellbook-id",
      text: "Combo Identifier",
    },
    {
      id: "popularity",
      text: "Popularity",
    },
    {
      id: "price",
      text: "Price",
    },
    {
      id: "previewed",
      text: "Previewed / Spoiled",
    },
    {
      id: "banned",
      text: "Banned",
    },
    {
      id: "sort",
      text: "Sort / Order",
    },
  ],
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
    {
      search: "pre<=3",
      description: "Combos that have no more than 3 prerequisites.",
    },
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
    {
      search: "steps>6",
      description: "Combos that contain greater than 6 steps.",
    },
  ],
  idSnippets: [
    {
      search: "spellbookid:450",
      description: "The combo for Basalt Monolith and Mesmeric Orb.",
    },
    {
      search: '-sid:450 card="Basalt Monolith" card="Mesmeric Orb"',
      description:
        "Combos that contain the cards Basalt Monolith and Mesmeric Orb except for combo 450.",
    },
  ],
  popularitySnippets: [
    {
      search: "popularity>1000",
      description:
        "Combos that are in more than 1000 decks according to EDHREC.",
    },
    {
      search: "decks<10",
      description:
        "Combos that are in less than 10 decks according to EDHREC.",
    },
  ],
  priceSnippets: [
    {
      search: "price<5",
      description:
        "Combos where the entire price of the combo is less than $5.00 according to Card Kingdom.",
    },
    {
      search: "usd>100 vendor:tcgplayer",
      description:
        "Combos where the entire price of the combo is greater than $100.00 according to TCGplayer.",
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
  bannedSnippets: [
    {
      search: "include:banned",
      description:
        "Include any combos that contain cards that are banned in Commander.",
    },
    {
      search: "is:banned",
      description:
        "Combos that contain at least one card that is banned in Commander.",
    },
  ],
  sortOrderSnippets: [
    {
      search: "results=1 sort:price order:descending",
      description:
        "Combos with exactly one result, sorted by most expensive to least expensive.",
    },
    {
      search: "ci:grixis sort:cards",
      description:
        "Combos with the grixis color identity sorted by the number of cards in them.",
    },
    {
      search: "steps<3 sort:colors order:descending",
      description:
        "Combos with fewer than 3 steps sorted by color identity, starting with the most colors and going to the fewest.",
    },
    {
      search: "decks>100 sort:created",
      description:
        "Combos that are in more than 100 decks, sorted by the date they were added to the site.",
    },
  ],
}

const SyntaxGuide:React.FC <Props> = ({}: Props) => {
  return (
    <PageWrapper>
      <SpellbookHead title="Commander Spellbook: Syntax Guide" description="Browse our search syntax for advanced EDH combo queries."/>
      <div className={styles.syntaxGuideContainer}>
        <div className="container pt-6 mb-6">
          <ArtCircle cardName="Goblin Guide" className="m-auto md:block hidden" />
          <h1 className="heading-title">Syntax Guide</h1>
          <p className="text-center">
            A variety of parameters can be used to search for combos.
          </p>
        </div>

        <div className="border-b-2 border-gray-400 w-full">
          <div className="container pb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap">
              {DATA.sections.map((section) => (
                <Link key={section.id} href={`#${section.id}`} className="button flex-grow text-center md:w-1/4">
                  <div>{section.text}</div>
                </Link>
                ))}
          </div>

          <p className="pl-4 pr-4">
            No matter what parameter is used, capitalization will be disregarded,
            so a search of
            &nbsp;<code>CARD:"BREATH OF" COLORIDENTITY:TEMUR RESULT:INFINITE</code>&nbsp;
            is equivalent to
            &nbsp;<code>card:"breath of" coloridentity:temur result:infinite</code>
          </p>
        </div>
      </div>
      <div className={styles.searchGuideContainer}>
      <SearchGuide headingCardName="Peek" snippets={DATA.cardSnippets} heading="Cards">
      <p>
        You can find cards in a combo simply by entering the card names, or
        parts of the card names, into the search bar. Passing multiple card
        names will result in combos that have cards that contain those words
        among the names of the cards in the combo.
      </p>
      <p>
        You can lookup longer names for cards by using the
        &nbsp;<code>card</code> key with single (<code>'</code>) or double
        (<code>"</code>) quotes. This will find combos that contain cards with
        names that include the whole phrase. For instance,
        &nbsp;<code>card:dream</code>, will include combos that contain the card
        Sickening Dreams, Dream Stalker, Dreamtail Heron, etc. If
        &nbsp;<code>card:"dream stalk"</code> is used, then only combos that contain
        Dream Stalker wil lbe displayed.
      </p>
      <p>
        To find combos with an exact card name, use
        &nbsp;<code>card=</code> instead.
      </p>
      <p>
        Use <code>-card</code> To find combos that do not include a certain
        card.
      </p>
      <p>
        The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
        &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can also be used with
        numbers to to find combos restricted by the number of cards.
      </p>

      <p>An alias for <code>card</code> is <code>cards</code>.</p>
    </SearchGuide>

  <SearchGuide heading="Color Identity" headingCardName="Fist of Suns" snippets={DATA.colorIdentitySnippets}>
    <p>
    The color identity of a combo determines what colors the combo is
  comprised of. The most basic search is in the form,
    <code>coloridentity:bug</code>, which in this example finds all the
  combos that can be played within a green, blue, black color identity.
</p>

  <p>
    The <code>coloridentity</code> parameter accepts full color names like
    &nbsp;<code>green</code> or the single character representations of the colors
    (<code>w</code>, <code>u</code>, <code>b</code>, <code>r</code>,
    &nbsp;<code>g</code>). You can use the names for color combinations such as
    &nbsp;<code>boros</code>, <code>izzet</code>, <code>naya</code>,
    &nbsp;<code>sultai</code>, etc.
  </p>

  <p>
    The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
    &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can also be used to
    find combos with a range of color identities. These operators can be
    used with the color values or a number to indicate the number of colors
    required for the combo.
  </p>

  <p>
    Aliases for the <code>coloridentity</code> key include
    &nbsp;<code>color_identity</code>, <code>color</code>, <code>colors</code>,
    &nbsp;<code>commander</code>, <code>id</code>, <code>ids</code>,
    &nbsp;<code>c</code>, and <code>ci</code>.
  </p>
</SearchGuide>

  <SearchGuide heading="Prerequisites" headingCardName="Long-Term Plans"  snippets={DATA.prerequisiteSnippets}>
    <p>
    The prerequisites are the elements that need to be in place before the
  combo can be initiated.
</p>

  <p>
    You can also use <code>-prerequisites</code> to find combos that do not
    contain the value passed.
  </p>

  <p>
    The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
    &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can also be used with
    numbers to to find combos restricted by the number of prerequisites.
  </p>

  <p>
    Aliases for <code>prerequisites</code> are <code>prerequisite</code> and
    &nbsp;<code>pre</code>.
  </p>
</SearchGuide>

  <SearchGuide heading="Steps" headingCardName="The Grand Calcutron" snippets={DATA.stepSnippets}>
    <p>
    The steps are the elements that need to be followed to execute the
  combo.
</p>

  <p>
    You can also use <code>-steps</code> to find combos that do not contain
    steps with the value passed.
  </p>

  <p>
    The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
    &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can also be used with
    numbers to to find combos restricted by the number of steps.
  </p>

  <p>An alias for <code>steps</code> is <code>step</code>.</p>
</SearchGuide>

  <SearchGuide heading="Results" headingCardName="Revel in Riches" snippets={DATA.resultSnippets}>
    <p>
    The results are the effects that occur as a result of completing the
  combo.
</p>

  <p>
    You can also use <code>-results</code> to find combos that do not
    contain results with the value passed.
  </p>

  <p>
    The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
    &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can also be used with
    numbers to to find combos restricted by the number of results.
  </p>

  <p>An alias for <code>results</code> is <code>result</code>.</p>
</SearchGuide>

  <SearchGuide heading="Spellbook ID" headingCardName="Fractured Identity"  snippets={DATA.idSnippets}>
    <p>
    You can also search by <code>spellbookid</code> if you want to find a
  specific combo by its id. Using more than one
  <code>spellbookid</code> will result in a query error.
</p>

  <p>
    <code>sid</code> and <code>sbid</code> are aliases for
    &nbsp;<code>spellbookid</code>.
  </p>

  <p>
    A more useful parameter to use is <code>-spellbookid</code>, to more
    easilly omit certain combos. For instance, for finding all combos using
    Basalt Monolith and Mesmeric Orb except
    <Link href="/combo/450/">combo 450</Link>.
  </p>
</SearchGuide>

  <SearchGuide heading="Popularity" headingCardName="Korvold, Fae-Cursed King"  snippets={DATA.popularitySnippets}>
    <p>
    You can also search by <code>popularity</code> to find combos by the
  number of decks that contain the combo according to
  <ExternalLink href="https://edhrec.com/">EDHREC</ExternalLink>.
</p>

  <p>
    Use the <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
    &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators when constructing your
    search.
  </p>

  <p>
    <code>deck</code> and <code>decks</code> are aliases for
    &nbsp;<code>popularity</code>.
  </p>
</SearchGuide>

  <SearchGuide heading="Price" headingCardName="Smothering Tithe"  snippets={DATA.priceSnippets}>
    <p>
    The <code>=</code>, <code>&gt;</code>, <code>&lt;</code>,
      &nbsp;<code>&gt;=</code>, <code>&lt;=</code> operators can be used with
      &nbsp;<code>price</code> to to find combos restricted by the price of the
  combo.
</p>

  <p>
    By default, the Card Kingdom price will be used when searching for
    combos. You can use <code>vendor</code> to override this behavior.
    Possible values are:
  </p>

  <ul>
    <li><code>cardkingdom</code></li>
    <li><code>tcgplayer</code></li>
  </ul>

  <p>
    Combos where the price is not available are omitted from search results
    when using the <code>price</code> parameter.
  </p>

  <p><code>usd</code> is an alias for <code>price</code>.</p>
</SearchGuide>

  <SearchGuide id="previewed" heading="Previewed / Spoiled" headingCardName="Spoils of Adventure" snippets={DATA.previewedSnippets}>
    <p>
    By default, combo results will include combos that contain cards that
  have been newly previewed and are <em>technically</em> not yet legal in
  Commander. To exclude these combos, use
      &nbsp;<code>exclude:previewed</code> or <code>exclude:spoiled</code>.
</p>

  <p>
    To find combos that contain cards that are not yet legal in Commander,
    use <code>is:previewed</code> or <code>is:spoiled</code>.
  </p>

  <p>
    To find combos that contain <em>no</em> cards that are not yet legal in
    Commander, use <code>not:previewed</code> or
    &nbsp;<code>not:spoiled</code> instead.
  </p>
</SearchGuide>

  <SearchGuide heading="Banned" headingCardName="Leovold, Emissary of Trest" snippets={DATA.bannedSnippets}>
    <p>
    By default, combo results will not include combos that contain cards
  that are banned in Commander. Use <code>include:banned</code> to allow
  combo results that are banned in Commander.
</p>

  <p>
    To find specific combos that contain cards that are banned in Commander,
    use <code>is:banned</code>.
  </p>

  <p>
    To find combos that contain <em>no</em> cards that are banned in
    Commander, use <code>not:banned</code> instead.
  </p>
</SearchGuide>

  <SearchGuide id="sort" heading="Sort / Order" headingCardName="Brainstorm" snippets={DATA.sortOrderSnippets}>
    <p>
    By default, combo results will be sorted by popularity (the number of
  decks the combo is in according to
  <ExternalLink href="https://edhrec.com/">EDHREC</ExternalLink>), starting
  with combos in the most decks and going to the least. Use
      &nbsp;<code>sort</code> to change the criteria for sorting the combos.
  Available options are:
    </p>

  <ul>
    <li>
      <code>colors</code> (or <code>ci</code>, <code>color-identity</code>,
      <code>color</code>)
    </li>

    <li><code>price</code> (or <code>usd</code>)</li>

    <li><code>results</code> (or <code>number-of-results</code>)</li>
    <li><code>steps</code> (or <code>number-of-steps</code>)</li>

    <li>
      <code>prerequisites</code> (or <code>number-of-prerequisites</code>)
    </li>

    <li><code>cards</code> (or <code>number-of-cards</code>)</li>

    <li><code>created</code></li>
  </ul>

  <p>
    By default, when sorted by popularity, the combo results are ordered in
    descending order. All other sort options order the results in ascending
    order instead. Use
    <code>order</code> to alter the default behavior.
  </p>

  <p>
    When sorting by price, combos with no price available are treated as
    having a price of 0.
  </p>
</SearchGuide>
      </div>
</div>
    </PageWrapper>
  )
}

export default SyntaxGuide
