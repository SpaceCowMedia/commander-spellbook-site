# Development Docs

This documentation is rendered as a website on [GitHub Pages](https://edhrec.github.io/commander-spellbook-site/). Any change to markdown files will be deployed after it gets merged into the `main` branch.

## Getting Started

The site requires [node v16](https://nodejs.org/en/download/) and npm 8 (which comes installed with node@16) to run locally, since it utilizes [workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to structure the repo.

If you are already using the [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) tool, you can run `nvm install` in the directory to get the correct version of node.

Once you have installed node, you can install the project's dependencies:

```bash
npm install
```

## Frontend App

- [Installation and setup](./frontend/installation-and-setup.md)
- [Creating a new page](./frontend/pages.md)
- [Creating a component](./frontend/components.md)

## Backend API

The backend (auth, api, database) is all managed by a separate API outside of this repo.

## Automated Testing

- [Integration Testing](./testing/integration-testing.md)
