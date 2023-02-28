import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

postDiscordWebhook("#grand-calcutron", {
  content: "Scheduled site deploy started.",
  embeds: [
    {
      color: 16776960,
      fields: [
        {
          name: "Deploy process has started",
          value: `[Watch deploy progress](${createGithubActionLink(true)})`,
        },
      ],
    },
  ],
});
