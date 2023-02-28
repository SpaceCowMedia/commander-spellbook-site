import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

const jobPath = `jobs/${process.env.GITHUB_JOB_ID}`;

postDiscordWebhook("#grand-calcutron", {
  content: "Automatically scheduled site deploy started.",
  embeds: [
    {
      color: 16776960,
      fields: [
        {
          name: "Deploy process has started",
          value: `[Watch deploy progress](${createGithubActionLink(jobPath)})`,
        },
      ],
    },
  ],
});
