import { CanvasRenderingContext2D, createCanvas, Image, loadImage } from 'canvas';
import { CardDetail, CardsApi, VariantsApi } from '@space-cow-media/spellbook-client';
import { NextApiRequest, NextApiResponse } from 'next';
import pluralize from 'pluralize';
import { apiConfiguration } from 'services/api.service';
import serverPath from 'lib/serverPath';
import { httpErrorStatus } from 'lib/httpErrors';
import { DEFAULT_ORDERING } from 'lib/constants';
import { cardComboQuery, commanderFormatTerm } from 'lib/cards';
import { topResults } from 'lib/cardCombos';
import { formatCount, IMAGE_CACHE_CONTROL } from 'lib/seo';
import { queryParameterAsString } from 'lib/queryParameters';
import { FACE_SEPARATOR } from 'lib/types';

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 48;
const CARD_HEIGHT = HEIGHT - PADDING * 2;
const CARD_WIDTH = Math.round((CARD_HEIGHT * 63) / 88);
const TEXT_LEFT = PADDING * 2 + CARD_WIDTH;
const TEXT_WIDTH = WIDTH - TEXT_LEFT - PADDING;
const PIP_SIZE = 44;
const FONT_FAMILY = 'Noto Sans';
const SAMPLE_SIZE = 30;
const RESULT_LINES = 3;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s*\S+$/, '')}…`;
    return kept;
  }
  return lines;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

async function loadCardImage(card: CardDetail): Promise<Image | undefined> {
  const url = card.imageUriFrontLarge ?? card.imageUriFrontNormal;
  if (!url) {
    return undefined;
  }
  try {
    return await loadImage(url);
  } catch (error) {
    console.error(`Error loading the image of card ${card.name}`, error);
    return undefined;
  }
}

async function loadComboSummary(card: CardDetail) {
  if (!card.id) {
    return { count: 0, results: [] as string[], legal: card.legalities.commander };
  }
  const page = await new VariantsApi(apiConfiguration()).variantsList({
    q: cardComboQuery(card, commanderFormatTerm(card.legalities.commander)),
    groupByCombo: false,
    ordering: DEFAULT_ORDERING,
    limit: SAMPLE_SIZE,
    count: true,
  });
  return {
    count: page.count ?? page.results.length,
    results: topResults(page.results, RESULT_LINES).map((result) => result.name),
    legal: card.legalities.commander,
  };
}

async function drawCardImage(card: CardDetail) {
  const [image, summary, gear] = await Promise.all([
    loadCardImage(card),
    loadComboSummary(card),
    loadImage(serverPath('images/gear.svg')),
  ]);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, '#222222');
  background.addColorStop(1, '#3b2458');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  roundedRect(ctx, PADDING, PADDING, CARD_WIDTH, CARD_HEIGHT, 18);
  ctx.clip();
  if (image) {
    ctx.drawImage(image, PADDING, PADDING, CARD_WIDTH, CARD_HEIGHT);
  } else {
    ctx.fillStyle = '#111111';
    ctx.fillRect(PADDING, PADDING, CARD_WIDTH, CARD_HEIGHT);
  }
  ctx.restore();

  let y = PADDING + 56;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 52px ${FONT_FAMILY}`;
  for (const line of wrapText(ctx, card.name.replaceAll(FACE_SEPARATOR, ' //\u00a0'), TEXT_WIDTH, 2)) {
    ctx.fillText(line, TEXT_LEFT, y);
    y += 62;
  }

  ctx.fillStyle = '#dfdfdf';
  ctx.font = `28px ${FONT_FAMILY}`;
  for (const line of wrapText(ctx, card.typeLine.split(FACE_SEPARATOR)[0], TEXT_WIDTH, 1)) {
    ctx.fillText(line, TEXT_LEFT, y);
    y += 24;
  }

  const pips = await Promise.all(
    card.identity
      .split('')
      .map((color) => loadImage(serverPath(`images/scryfall/identity/${color.toUpperCase()}.svg`))),
  );
  pips.forEach((pip, index) => ctx.drawImage(pip, TEXT_LEFT + index * (PIP_SIZE + 10), y, PIP_SIZE, PIP_SIZE));
  y += PIP_SIZE + 72;

  ctx.fillStyle = '#c18aff';
  ctx.font = `bold 64px ${FONT_FAMILY}`;
  const count = formatCount(summary.count);
  ctx.fillText(count, TEXT_LEFT, y);
  const countWidth = ctx.measureText(count).width;
  ctx.fillStyle = '#ffffff';
  ctx.font = `30px ${FONT_FAMILY}`;
  ctx.fillText(
    `${pluralize('combo', summary.count)}${summary.count > 0 && summary.legal ? ' in Commander' : ''}`,
    TEXT_LEFT + countWidth + 16,
    y,
  );
  y += 52;

  ctx.fillStyle = '#dfdfdf';
  ctx.font = `26px ${FONT_FAMILY}`;
  for (const result of summary.results) {
    ctx.fillText(wrapText(ctx, `• ${result}`, TEXT_WIDTH, 1)[0], TEXT_LEFT, y);
    y += 38;
  }

  const brand = 'Commander Spellbook';
  ctx.font = `bold 30px ${FONT_FAMILY}`;
  const brandWidth = ctx.measureText(brand).width;
  const brandX = WIDTH - PADDING - brandWidth;
  const brandY = HEIGHT - PADDING;
  ctx.drawImage(gear, brandX - 52, brandY - 34, 40, 40);
  ctx.fillStyle = '#c18aff';
  ctx.fillText(brand, brandX, brandY);

  return canvas.toBuffer('image/png');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = queryParameterAsString(req.query.id) ?? '';
  let card: CardDetail;
  try {
    card = await new CardsApi(apiConfiguration()).cardsRetrieve({ id });
  } catch (error) {
    const status = httpErrorStatus(error);
    if (status === 404 || status === 400) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
    return;
  }
  try {
    const buffer = await drawCardImage(card);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', IMAGE_CACHE_CONTROL);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
