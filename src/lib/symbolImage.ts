import { readFile } from 'fs/promises';
import { Image, loadImage } from 'canvas';
import serverPath from './serverPath';

// Width and height are mandatory for the svg to be displayed correctly from canvas 3.0.0,
// but Scryfall's symbols only have a 100x100 viewBox
export async function loadSymbolImage(symbol: string): Promise<Image> {
  const svg = await readFile(serverPath(`images/scryfall/symbols/${symbol.toUpperCase()}.svg`), 'utf8');
  return loadImage(Buffer.from(svg.replace('<svg ', "<svg width='100' height='100' ")));
}
