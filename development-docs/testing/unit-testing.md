# Unit Testing

We use [jest](https://jestjs.io/) as our test runner.

Any new features added will need to be thoroughly unit tested. If you are unfamiliar with unit testing, but want to make a change, go ahead and open a PR and ask for help getting unit tests set up for your feature.

To run tests for all workpaces, run:

```
npm test
```

## Frontend Unit Tests

To run (and continuoulsly watch for changes) on just the frontend workspace, run:

```
npm rum test:watch-frontend
```

To watch only a particular directory (such as only running the tests against the /test/pages)

```
npm rum test:watch-frontend test/pages/
```

## Backend Unit Tests

To run (and continuoulsly watch for changes) on just the frontend workspace, run:

```
npm rum test:watch-backend
```

To watch only a particular directory (such as only running the tests against the /test/db/ directory)

```
npm rum test:watch-backend test/db/
```
