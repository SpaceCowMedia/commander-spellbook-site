# Components

Every component has its own folder, named like the component, holding `Component.tsx`, its `component.module.scss` and its tests (`Component.test.tsx`). A part only that component uses nests inside its folder; a part that siblings share gets a folder of its own.

## Where a component goes

1. **What it shows decides its area.** A component that shows Magic or Spellbook content lives in the area of that content, whether or not it takes children:

   | Area           | Holds                                                                      |
   | -------------- | -------------------------------------------------------------------------- |
   | `card`         | cards and templates: images, names, links, tooltips, previews, spoiler fog |
   | `symbols`      | mana and other card symbols, color identities, text with symbols in it     |
   | `combo`        | the combo page and what describes a single combo                           |
   | `bracket`      | Commander brackets of combos and decks                                     |
   | `salt`         | salt scores and votes                                                      |
   | `search`       | search inputs, results, pagination and the syntax guide                    |
   | `findMyCombos` | the decklist lookup                                                        |
   | `submission`   | combo and update submissions                                               |
   | `home`         | the home page                                                              |

2. **Anything else goes to `layout` or `ui`,** depending on one question: does it take `children`?
   - `layout` holds components that contain and handle `children`, or other content nodes like the panels of `Tab`: they wrap, arrange, show, hide or animate what they're given. Examples: `PageWrapper`, `Modal`, `Tab`, `Alert`, `PageTurn`.
   - `ui` holds self-contained pieces of the interface that render everything from their props. Examples: `Icon`, `Loader`, `ProgressBar`, `Footer`.

A component never imports another component's stylesheet. When two components need the same look, one of them exposes it through a prop, like `<Loader centered />`.

## Logic

Code without JSX lives in `src/lib`, which mirrors the component areas (`lib/card`, `lib/combo`, `lib/salt`…). Helpers that every area uses are grouped by what they do: `lib/http`, `lib/react` and `lib/text`. Site-wide modules like `viewTransitions` stay at the root of `lib`. Calls to external services live in `src/services`.

## Imports

Import through the alias paths: `components/…`, `lib/…`, `services/…`, `styles/…`, `assets/…`. Only files in the same folder, or in a folder nested inside it, are imported with `./`. ESLint rejects `../`.
