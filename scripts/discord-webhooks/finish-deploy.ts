import postDiscordWebhook from "../shared/post-discord-webhook";

const link = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

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
          value: `[See deploy logs](${link})`,
        },
      ],
    },
  ],
});
