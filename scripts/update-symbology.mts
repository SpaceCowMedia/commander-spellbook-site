import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import type { ScryfallList } from '@scryfall/api-types';

const SYMBOLS_FOLDER = join(import.meta.dirname, '../public/images/scryfall/symbols');
const INDEX = join(import.meta.dirname, '../src/assets/symbology.json');
const HEADERS = { 'User-Agent': 'CommanderSpellbook/1.0', Accept: 'application/json;q=0.9,*/*;q=0.8' };

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response;
}

const { data }: ScryfallList.CardSymbols = await (await get('https://api.scryfall.com/symbology')).json();

await rm(SYMBOLS_FOLDER, { recursive: true, force: true });
await mkdir(SYMBOLS_FOLDER, { recursive: true });
const symbols = [];
for (const { symbol, english, svg_uri } of data) {
  if (!svg_uri) {
    continue;
  }
  const file = new URL(svg_uri).pathname.split('/').pop()!;
  await writeFile(join(SYMBOLS_FOLDER, file), Buffer.from(await (await get(svg_uri)).arrayBuffer()));
  symbols.push({ symbol, english, file });
}

const prettierConfig = await resolveConfig(INDEX, { editorconfig: true });
await writeFile(INDEX, await format(JSON.stringify(symbols), { ...prettierConfig, filepath: INDEX }));
console.log(`Saved ${symbols.length} symbols to ${SYMBOLS_FOLDER}`);
