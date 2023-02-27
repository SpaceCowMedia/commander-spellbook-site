import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

const deployReasons = (process.env.DEPLOY_REASON || "").split("|").join("\n");

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
          value: `[View Github Action logs](${createGithubActionLink()})`,
        },
      ],
    },
  ],
});
