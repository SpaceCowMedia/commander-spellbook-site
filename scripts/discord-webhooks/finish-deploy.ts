import fs from "fs";
import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";
import postComboToDiscord from "../shared/post-combos-to-discord";

const deployReasons = (process.env.DEPLOY_REASON || "").split("|").join("\n");
const changelog = JSON.parse(
  fs.readFileSync("./frontend/public/changelog.json", "utf8")
);

const { addedCombos, deletedCombos, updatedCombos } = changelog;

postDiscordWebhook("#grand-calcutron", {
  content: "Deploy Complete",
  embeds: [
    {
      color: 5763719,
      fields: [
        {
          name: "Deploy Details",
          value: deployReasons,
        },
        {
          name: "Deploy log",
          value: `[View Github Action log](${createGithubActionLink()})`,
        },
      ],
    },
  ],
});

if (addedCombos.length > 0) {
  postComboToDiscord("#changelog", {
    title: `${addedCombos.length} combo(s) added to the database`,
    combos: addedCombos,
  });
}

if (deletedCombos.length > 0) {
  postComboToDiscord("#changelog", {
    title: `${deletedCombos.length} combo(s) removed from the database`,
    combos: deletedCombos,
    includeLinks: false
  });
}
if (updatedCombos.length > 0) {
  postComboToDiscord("#changelog", {
    title: `${updatedCombos.length} combo(s) were updated in the database`,
    combos: updatedCombos,
  });
}

// TODO updated combos
