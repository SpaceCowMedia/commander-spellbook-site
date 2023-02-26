import postDiscordWebhook from "../shared/post-discord-webhook";

const link = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

postDiscordWebhook("#grand-calcutron", {
  content: "Automatically scheduled site deploy cancelled.",
  embeds: [
    {
      color: 16776960,
      fields: [
        {
          name: "No change in combo data or website code detected.",
          value: `[View Github Action logs](${link})`,
        },
      ],
    },
  ],
});
