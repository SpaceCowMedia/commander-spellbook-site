import postDiscordWebhook from "../shared/post-discord-webhook";
import createGithubActionLink from "../shared/create-github-action-link";

postDiscordWebhook("#grand-calcutron", {
  content: "Scheduled site deploy failed.",
  embeds: [
    {
      color: 15548997,
      fields: [
        {
          name: "Something went wrong during deploy. If this keeps happening, reach out to the devs at EDHRec to investigate cause.",
          value: `[View Deploy logs](${createGithubActionLink(true)})`,
        },
      ],
    },
  ],
});
