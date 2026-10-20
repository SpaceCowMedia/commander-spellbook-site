# Components

Create a `React` component in the `components` directory. If it's a component specific to a page, nest it in a directory with the same name as the page.

## Links

- Pages of this site, jumps within the page included: `Link` from `next/link`, or `CardLink` for a card. They open in the same tab.
- Other sites, the backend admin included: `ExternalLink`. They open in a new tab.
- Never a plain `<a>`: ESLint allows it only inside `ExternalLink`.
- Pages with work in progress, such as the submission forms and salt voting, wrap it in `NewTabContext`, so the cards and combos it shows open in a new tab instead of throwing the work away. Their own links take `target="_blank"`.
- Logging in is a redirect through the backend and back, not a link to read elsewhere, so it stays in the tab.
