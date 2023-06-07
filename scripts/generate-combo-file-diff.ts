import local from '../frontend/public/api/combo-data.json'
import {config as configureDotenv} from "dotenv";
import fs from "fs";
import getData from "./shared/get";
import {CompressedApiResponse} from "spellbook-client-next/lib/types";


const generateComboFileDiff = async () => {
  configureDotenv();

  const localJson = local as CompressedApiResponse[]

  const liveJson = await getData('https://commanderspellbook.com/api/combo-data.json') as CompressedApiResponse[]

  const idMap: Record<string, CompressedApiResponse> = {}

  for (const combo of localJson) {
    idMap[combo.d] = combo
  }

  const missingCombos: { id: string, url: string }[] = []

  for (const combo of liveJson) {
    if (!idMap[combo.d]) missingCombos.push({id: combo.d, url: `https://commanderspellbook.com/combo/${combo.d}/`})
  }

  fs.writeFileSync(
    "./external-data/missing-combos.json",
    JSON.stringify(missingCombos)
  );
  console.log('done', missingCombos.length)
}


generateComboFileDiff()


