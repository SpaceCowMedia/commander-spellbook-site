import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

postDiscordWebhook("#grand-calcutron", {
  content: "Deploy Complete",
  embeds: [
    {
      color: 5763719,
      fields: [
        {
          name: "Deploy Details",
          value: process.env.DEPLOY_REASON || "",
        },
        {
          name: "Deploy log",
          value: `[See deploy logs](${createGithubActionLink()})`,
        },
      ],
    },
  ],
});
