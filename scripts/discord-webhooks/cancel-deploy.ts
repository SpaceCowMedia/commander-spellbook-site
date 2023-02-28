import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

postDiscordWebhook("#grand-calcutron", {
  content: "Automatically scheduled site deploy cancelled.",
  embeds: [
    {
      color: 16776960,
      fields: [
        {
          name: "No change in combo data or website code detected.",
          value: `[View Github Action log](${createGithubActionLink()})`,
        },
      ],
    },
  ],
});
