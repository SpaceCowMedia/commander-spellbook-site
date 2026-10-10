# Unit Testing

Unit and component tests run on [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) in a `jsdom` environment.

## What to test

Test anything with logic of its own: parsers, calculations, hooks and components that handle input or announce results. Query components the way a person would find them, by role and accessible name, rather than by class or test id.

## Where tests live

Tests live under `tests/unit`, at the same path as the file they test and with its name: `src/components/ui/Stepper/Stepper.tsx` is tested by `tests/unit/components/ui/Stepper/Stepper.test.tsx`, `src/lib/combo/widgets/shared/lifeLoop.ts` by `tests/unit/lib/combo/widgets/shared/lifeLoop.test.ts`. They import what they test through the alias paths. Nothing for testing lives in `src`.

Combo widget tests share the helpers in `tests/unit/lib/combo/widgets/testing`: real variants trimmed to the texts the widgets read (`variants.json`, with type lines where a widget counts creature types), and `expectSaneAtExtremes` to run a calculator with every input at its limits, failing it when it takes too long.

## How to run them

| Task                                | Command              |
| ----------------------------------- | -------------------- |
| Run every test once                 | `pnpm test`          |
| Re-run tests as files change        | `pnpm test:watch`    |
| Run one file, or the files matching | `pnpm test lifeLoop` |

CI runs `pnpm test` on every push.
