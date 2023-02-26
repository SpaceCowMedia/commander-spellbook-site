import postDiscordWebhook from "../shared/post-discord-webhook";

const link = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

postDiscordWebhook("#grand-calcutron", {
  content: "Scheduled site deploy failed.",
  embeds: [
    {
      color: 15548997,
      fields: [
        {
          name: "Something went wrong during deploy. If this keeps happening, reach out to the devs at EDHRec to investigate cause.",
          value: `[View Github Action logs](${link})`,
        },
      ],
    },
  ],
});
