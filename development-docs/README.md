# Development Docs

## Getting Started

The site requires [node v16](https://nodejs.org/en/download/) and npm 8 (which comes installed with node@16) to run locally, since it utilizes [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to structure the repo.

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

The backend (auth, api, database) is all managed by [Firebase](https://firebase.google.com/).

- [Running the app locally](./backend/running-locally.md)
- [Authentication/User Accounts](./backend/users.md)
- [Database Collections](./backend/database.md)
- [API](./backend/api.md)
- [Manual Deploys](./backend/manual-deploys.md)

## Automated Testing

- [Unit Testing](./testing/unit-testing.md)
- [Integration Testing](./testing/integration-testing.md)
