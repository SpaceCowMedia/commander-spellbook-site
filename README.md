# Development Docs

This documentation is rendered as a website on [GitHub Pages](https://edhrec.github.io/commander-spellbook-site/). Any change to markdown files will be deployed after it gets merged into the `main` branch.

## Getting Started

This project uses [pnpm](https://pnpm.io/) (v10.16.0 or newer) as its package manager. The exact version we build with is pinned in the `packageManager` field of `package.json`.

Once you have installed node, install pnpm globally:

```bash
npm install --global pnpm
```

On Node 24 and older you can instead use [Corepack](https://nodejs.org/api/corepack.html), which reads the pinned version straight from `package.json` (Corepack is no longer bundled with Node 25+):

```bash
corepack enable pnpm
```

Then install the project's dependencies:

```bash
pnpm install
```

## Common Commands

If you are coming from `npm` or `yarn`, most commands map over directly. Note that `pnpm <script>` works for any script in `package.json`, so `pnpm run dev` and `pnpm dev` are equivalent.

| Task                                 | Command                          |
| ------------------------------------ | -------------------------------- |
| Install all dependencies             | `pnpm install`                   |
| Install exactly from the lockfile    | `pnpm install --frozen-lockfile` |
| Run the dev server                   | `pnpm dev`                       |
| Build for production                 | `pnpm build`                     |
| Run the production build             | `pnpm start`                     |
| Lint (eslint + stylelint + prettier) | `pnpm lint`                      |
| Auto-format                          | `pnpm prettier`                  |
| Type-check                           | `pnpm tsc --noEmit`              |
| Open Cypress                         | `pnpm cy:open`                   |
| Run Cypress headlessly               | `pnpm cy:run`                    |
| Add a runtime dependency             | `pnpm add <pkg>`                 |
| Add a dev dependency                 | `pnpm add -D <pkg>`              |
| Remove a dependency                  | `pnpm remove <pkg>`              |
| Update deps (respecting semver)      | `pnpm update`                    |
| See why a package is installed       | `pnpm why <pkg>`                 |
| List outdated packages               | `pnpm outdated`                  |
| Run a one-off binary                 | `pnpm dlx <pkg>` (like `npx`)    |

## Frontend App

- [Installation and setup](./frontend/installation-and-setup.md)
- [Creating a new page](./frontend/pages.md)
- [Creating a component](./frontend/components.md)

## Backend API

The backend (auth, api, database) is all managed by a separate API outside of this repo.

## Automated Testing

- [Integration Testing](./testing/integration-testing.md)
