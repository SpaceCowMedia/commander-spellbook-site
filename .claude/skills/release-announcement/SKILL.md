---
name: release-announcement
description: Write the Commander Spellbook Site release announcement (changelog, release notes) for the changes since a given version or in a pull request. Use whenever a release announcement, changelog or release notes are asked for.
---

# Release announcement

Adapted from the backend's skill of the same name (`../commander-spellbook-backend/.claude/skills/release-announcement/SKILL.md`), whose format rules apply here unchanged.

The announcement is published verbatim, so the heading hierarchy and the two-space bullet indentation must match this skeleton exactly (`<>` wraps a replacement):

```text
# Commander Spellbook Site <new version>
## Website Changelog
### Breaking Changes
  * Removed ...
### Other Changes
  * Added ...
## Embed Changelog
  * Added ...
  * Changed ...
```

- Fill `<new version>` with the release version.
- Drop any heading with no entries under it.
- Keep bullets as `  * <verb> ...` (Added / Changed / Removed / Fixed).
- The `###` subheadings only separate breaking changes from the rest: when a section has no breaking changes, drop `### Other Changes` too and list its bullets straight under the `##` heading.

## Which section a change belongs to

- The Website Changelog is for the pages people visit: what they show, their links, forms and search options.
- A website change is breaking when it breaks something people or other sites rely on, such as a page URL removed or moved without a redirect, or a search page query parameter that changed meaning.
- The Embed Changelog is for `public/embed.js` and the embed code that combo pages hand out, which other sites paste into their own pages.
- The search syntax is parsed by the backend and belongs in its announcement; only the site's own help for it (syntax guide, advanced search form) goes here.
- Leave out changes invisible to most people, such as refactors, and fixes to features that were never released.

## Gathering the changes

- Release tags carry a `v` prefix (`v0.75.2`) and are created by semantic-release from the conventional commits merged into `main` (`.releaserc.yaml`). The floating tags `v0`, `v0.1` and `latest` are stale, so ignore them. The new version is the latest tag on HEAD, if there is one.
- A pull request has no tag yet: its version is the one semantic-release will give it on merge, counted from the latest release tag on `main`. That is the next minor for any `feat:` commit, otherwise the next patch for `fix:` commits. Say which version you assumed.
- List the commits with `git log --no-merges v<old>..HEAD` (for a pull request, `git log --no-merges main..HEAD`) and read each commit's body and diff, not just its subject.
- Leave out dependency bumps, CI changes and test-only commits unless they change behaviour someone would notice.
