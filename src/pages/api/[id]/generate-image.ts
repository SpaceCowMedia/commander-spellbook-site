import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import { VariantsApi } from '@spacecowmedia/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { NextApiRequest, NextApiResponse } from 'next';

const manaSymbols: { [key: string]: string } = {
  W: 'https://svgs.scryfall.io/card-symbols/W.svg',
  U: 'https://svgs.scryfall.io/card-symbols/U.svg',
  B: 'https://svgs.scryfall.io/card-symbols/B.svg',
  R: 'https://svgs.scryfall.io/card-symbols/R.svg',
  G: 'https://svgs.scryfall.io/card-symbols/G.svg',
};
const width = 500;
const manaOffset = 20;
const iWidth = 32;
const border = 4;
const leftOffset = 10;
const lineOffset = 24;
const fontSize = 16;
const headerHeight = iWidth + lineOffset;
const footerHeight = 45;

async function headerCanvas(identityArray: any[]) {
  // Mana pips background
  let canvas1 = createCanvas(width, headerHeight);
  let ctx = canvas1.getContext('2d');
  ctx.fillStyle = '#333';
  ctx.fillRect(0 + border, 0 + border, canvas1.width - border * 2, canvas1.height - border * 2);
  let spacer = manaOffset + iWidth;
  let startManaPos = width / 2 - ((identityArray.length - 1) * spacer) / 2;
  for (let [index, letter] of identityArray.entries()) {
    let position = index * spacer + startManaPos;
    let img = await loadImage(manaSymbols[letter]);
    ctx.drawImage(img, position, manaOffset / 2, iWidth, iWidth);
  }
  return canvas1;
}

function cardsUsedCanvas(cards: string | any[]) {
  // Cards Used
  let canvasHeight = cards.length * lineOffset + border;
  let canvas2 = createCanvas(width, canvasHeight);
  let ctx = canvas2.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.font = `${fontSize}px Roboto, sans-serif`;
  let nextLine = 0 + lineOffset;
  for (let card of cards) {
    ctx.fillText(card.name, leftOffset, nextLine);
    nextLine = nextLine + lineOffset;
  }
  return canvas2;
}

function preReqCanvas(prereqs: string | any[]) {
  // more pre-reqs
  let canvas3 = createCanvas(width, lineOffset + border);
  let ctx = canvas3.getContext('2d');
  let prereqCount = prereqs.length;
  ctx.fillStyle = '#6B7280';
  ctx.font = `${fontSize - 2}px Roboto, sans-serif`;
  ctx.fillText(`+${prereqCount} other prerequisite${prereqCount > 1 ? 's' : ''}`, leftOffset, lineOffset);
  return canvas3;
}

function separatorCanvas() {
  // Separator line between card names and abilities
  let canvas4 = createCanvas(width, border);
  let ctx = canvas4.getContext('2d');
  let nextLine = 0;
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = border / 2;
  ctx.beginPath();
  ctx.moveTo(border, nextLine);
  ctx.lineTo(width - border, nextLine);
  ctx.stroke();
  return canvas4;
}

function comboOutcomesCanvas(produces: any[]) {
  // Combo Outcomes
  let canvasHeight = produces.length * lineOffset + border;
  let canvas5 = createCanvas(width, canvasHeight);
  let ctx = canvas5.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.font = `${fontSize}px Roboto, sans-serif`;
  let nextLine = 0 + lineOffset;
  produces.forEach((product) => {
    ctx.fillText(product.feature.name, leftOffset, nextLine);
    nextLine = nextLine + lineOffset;
  });
  return canvas5;
}

async function footerCanvas() {
  // Commander Spellbook at the bottom
  let canvas6 = createCanvas(width, footerHeight);
  let ctx = canvas6.getContext('2d');
  ctx.fillStyle = '#333';
  ctx.fillRect(0 + border, 0 + border, width - border * 2, footerHeight - border * 2);
  let text = 'Commander Spellbook';
  const gear = await loadImage('https://commanderspellbook.com/images/gear.svg');
  ctx.fillStyle = '#866da8';
  ctx.font = `bold ${fontSize}px Roboto, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const padding = 20;
  const totalWidth = iWidth + textWidth;
  const startX = (canvas6.width - totalWidth) / 2;
  let nextLine = 0 + lineOffset + border;
  ctx.drawImage(gear, startX, nextLine + border / 2 - lineOffset, iWidth, iWidth);
  ctx.fillText(text, startX + iWidth + padding, nextLine);
  return canvas6;
}

function drawImage(ctx: CanvasRenderingContext2D, canvas: Canvas, yPos: number) {
  ctx.drawImage(canvas, 0, yPos);
  return yPos + canvas.height;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const configuration = apiConfiguration();
  const variantsApi = new VariantsApi(configuration);
  try {
    const combo = await variantsApi.variantsRetrieve({ id: req.query.id as string });
    if (!combo) {
      return res.status(404).json({ error: 'Combo not found' });
    }
    const identityArray = combo.identity.split('');
    const cards = combo.uses.map((item) => item.card);
    const prereqs = combo.otherPrerequisites.split('\n');
    const produces = combo.produces;

    let header_c = await headerCanvas(identityArray);
    let cardsUsed_c = await cardsUsedCanvas(cards);
    let prereq_c = await preReqCanvas(prereqs);
    let separator_c = await separatorCanvas();
    let produces_c = await comboOutcomesCanvas(produces);
    let footer_c = await footerCanvas();

    let calcHeight =
      header_c.height + cardsUsed_c.height + prereq_c.height + separator_c.height + produces_c.height + footer_c.height;
    const canvas = createCanvas(width, calcHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(border, border, canvas.width - border * 2, canvas.height - border * 2);
    let nextLine = drawImage(ctx, header_c, 0);
    nextLine = drawImage(ctx, cardsUsed_c, nextLine);
    nextLine = drawImage(ctx, prereq_c, nextLine);
    nextLine = drawImage(ctx, separator_c, nextLine);
    nextLine = drawImage(ctx, produces_c, nextLine);
    drawImage(ctx, footer_c, nextLine);

    res.setHeader('Content-Type', 'image/png');
    const buffer = canvas.toBuffer('image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
