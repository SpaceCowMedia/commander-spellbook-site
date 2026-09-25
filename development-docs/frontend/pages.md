# Pages

Create a `React` component in the pages directory, where the name of the file is the path a user will navigate to in the url.

In general, try to keep page logic simple. Pull any complex logic out into a component in the `components` directory in a folder with the same name as the route.

## Page transitions

Navigations animate with React's `<ViewTransition>`. Every page sits in a keyed sheet in `PageWrapper`, which fades out and in when its key changes. The key defaults to the URL path, so query changes update a page in place.

- A page that should animate on query changes sets a static `transitionKey`, such as `Search.transitionKey = queryTransitionKey('q', 'variant')`.
- Paginated lists wrap only their results in `<PageTurn page={page}>`, and their Previous/Next controls navigate with `pushWithTransition(router, url, PAGE_TURN_FORWARD)` (or `PAGE_TURN_BACK`). The results then turn like a page while the rest of the page stays put, starting from the top of the page, where Next would scroll anyway. Never return or await `router.push` inside `startTransition`: it resolves only after the new page commits, so the transition would wait on itself forever.
- `NavigationTransitionTypes` in `_app` tags each navigation with its transition type, which the Pages Router cannot do on its own. It registers the app's only `Router.beforePopState` callback, so extend that one instead of registering another.

All motion lives in `src/assets/view-transitions.css`. `_document` gives the root an inline `view-transition-name`, so that file, rather than React, decides what the root snapshot does: it keeps it still.
