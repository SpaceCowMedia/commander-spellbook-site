import type { CompressedApiResponse } from "@spellbook/frontend/lib/api/types";
import post from "./post";
import chunkifyArray from "./chunkify-array";

// TODO move to top level script
require("dotenv").config();

type Channel = "#changelog";
type ComboPayload = {
  title?: string;
  combos: CompressedApiResponse[];
};

// https://discord.com/developers/docs/resources/channel#embed-object-embed-limits
const MAX_FIELD_ENTRIES = 25;

const channelToWebhook = {
  "#changelog": process.env.DISCORD_CHANGELOG_WEBHOOK_URL,
} as Record<Channel, string>;

// need to specify the exact id for the emoji for it to work in Discord
const manaToEmoji = {
  w: "<:manaw:673716795991130151>",
  u: "<:manau:673716795890335747>",
  b: "<:manab:673716795651391519>",
  r: "<:manar:673716795978285097>",
  g: "<:manag:673716795491876895>",
} as Record<string, string>;

function parseIdentity(colors: string) {
  return colors
    .split(",")
    .map((mana) => {
      return manaToEmoji[mana];
    })
    .join("");
}

// posts combos as fields in embeds of webhooks
export default function postComboToDiscord(
  channel: Channel,
  payload: ComboPayload
) {
  const url = channelToWebhook[channel];

  if (!url) {
    // log and noop if the webhook url is not set
    // eslint-disable-next-line no-console
    console.error(
      "Discord channel",
      channel,
      "could not be found. Are your environmental variables set?"
    );

    return Promise.resolve();
  }

  const comboPayloads = payload.combos.map((combo) => {
    const identity = parseIdentity(combo.i);
    const cards = combo.c.join(" | ");
    const link = `https://commanderspellbook.com/combo/${combo.d}`;

    return {
      name: `${identity} Combo ${combo.d}`,
      value: `[${cards}](${link})`,
    };
  });

  // we can send a max of 25 fields
  // technically Discord supports up to 10 embeds, with
  // 25 fields each, but it quickly became obvious that
  // we'd hit the max embed file size limit after 1.25
  // full embeds, so just send separate webhooks
  // should only become a problem if we send more than 30
  // webhooks in a minute, which would be 750 combo notifications
  const fieldChunks = chunkifyArray(comboPayloads, MAX_FIELD_ENTRIES);
  // using a promise chain allows us to ensure the combos get
  // posted in order, which only really matters for the first
  // one, since it has the title for the Webhook
  let promiseChain = Promise.resolve() as Promise<unknown>;

  fieldChunks.forEach((chunk, index) => {
    // we only want to attach a title for the first chunk
    const content = index === 0 ? payload.title : "";
    const body = {
      content,
      embeds: [
        {
          fields: chunk,
        },
      ],
    };

    promiseChain = promiseChain.then(() => {
      return post(url, body);
    });
  });

  return promiseChain.catch((err) => {
    // we log the errors, but make them non-blocking
    // eslint-disable-next-line no-console
    console.error(
      "Something went wrong posting combos to Discord channel",
      channel
    );
    // eslint-disable-next-line no-console
    console.error(err);
  });
}
