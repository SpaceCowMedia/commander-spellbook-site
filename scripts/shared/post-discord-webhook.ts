import post from "./post";

require("dotenv").config();

export type Channel = "#changelog" | "#grand-calcutron";

type Field = {
  name: string;
  value: string;
  inline?: boolean;
};
type Embed = {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: Field[];
  footer?: {
    text?: string;
    icon_url?: string;
  };
};
type DiscordWebhookPayload = {
  embeds?: Embed[];
  content?: string;
};

const channelToWebhook = {
  "#changelog": process.env.DISCORD_CHANGELOG_WEBHOOK_URL,
  "#grand-calcutron": process.env.DISCORD_DEPLOY_WEBHOOK_URL,
} as Record<Channel, string>;

// posts combos as fields in embeds of webhooks
export default function sendWebhookToDiscord(
  channel: Channel,
  payload: DiscordWebhookPayload
) {
  const url = channelToWebhook[channel];

  if (!url) {
    return Promise.reject(
      new Error(
        `Discord channel ${channel} could not be found. Are your environmental variables set?`
      )
    );
  }

  return post(url, payload);
}
