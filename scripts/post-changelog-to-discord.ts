import get from "./shared/get";
import postCombosToDiscord from "./shared/post-combos-to-discord";

type ChangelogEntry = {
  id: string;
  cards: string[];
};
type Changelog = {
  addedCombos: ChangelogEntry[];
  deletedCombos: ChangelogEntry[];
  updatedCombos: { id: string; change: string }[];
};

const PRODUCTION_CHANGELOG_URL =
  "https://commanderspellbook.com/changelog.json";

get(PRODUCTION_CHANGELOG_URL).then((data) => {
  const changelog = data as Changelog;

  postCombosToDiscord("#changelog", {
    title: "something",
    comobs: changelog.addedCombos,
  });
});
