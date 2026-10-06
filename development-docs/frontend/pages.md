# Pages

Create a `React` component in the pages directory, where the name of the file is the path a user will navigate to in the url.

In general, try to keep page logic simple. Pull any complex logic out into a component in the `components` directory in a folder with the same name as the route.

## Page transitions

Navigations animate with React's `<ViewTransition>`. Every page sits in a keyed sheet in `PageWrapper`, which fades out and in when its key changes. The key defaults to the URL path, so query changes update a page in place.

- A page that should animate on query changes sets a static `transitionKey`, such as `Search.transitionKey = queryTransitionKey('q', 'variant')`.
- Paginated lists wrap only their results in `<PageTurn page={page}>`, and their Previous/Next controls navigate with `pushWithTransition(router, url, pageTurn(page, page + 1))` (or `page - 1`). The results turn like a book's page: going forward, their right half turns over onto the left one, with the next page's left half printed on its back; going back, the left half turns over to the right. The rest of the page stays put, and the turn starts from the top of the page, where Next would scroll anyway. Never return or await `router.push` inside `startTransition`: it resolves only after the new page commits, so the transition would wait on itself forever.
- The turning sheet needs half of each page while the flat halves show the other ones, but a view transition captures each element once. So while a page turns, `PageTurn` keeps a copy of its page's DOM under itself as the `page-turn-sheet` snapshot: rendering the page again would cost as much as the navigation itself, right before the turn starts. The copy follows the page being left until the navigation commits, then the new one while its effects fill it in. The view transition captures the old page as it is when React starts it, so `NavigationTransitionTypes` commits the copy with `flushSync` right before Next renders the navigation, and `PageTurn` removes it once the transition has finished.
- The sheet stays flat: a snapshot only turns as one plane, and bending it would take a strip per facet, each one more print of both pages. Shading toward its lifted edge makes it look curved instead.
- `NavigationTransitionTypes` in `_app` tags each navigation with its transition type, which the Pages Router cannot do on its own. It registers the app's only `Router.beforePopState` callback, so extend that one instead of registering another.

All motion lives in `src/assets/view-transitions.css`. `_document` gives the root an inline `view-transition-name`, so that file, rather than React, decides what the root snapshot does: it keeps it still.
