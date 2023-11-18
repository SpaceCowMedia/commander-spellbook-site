import requestService from "./request.service";
import {convertDecklistToArray} from "../lib/decklist-parser";
import {FindMyCombosResponseType} from "../types/findMyCombos";

const FIND_MY_COMBOS_ENDPOINT = 'https://backend.commanderspellbook.com/find-my-combos'

const findFromLists = async (commanders: string[], cards: string[]): Promise<FindMyCombosResponseType> => {
  return requestService.post(FIND_MY_COMBOS_ENDPOINT, { commanders, main: cards })
}

const findFromString = async (decklist: string, commanderList: string): Promise<FindMyCombosResponseType> => {
  return findFromLists(convertDecklistToArray(commanderList), convertDecklistToArray(decklist))
}


const findMyCombosService = {
  findFromLists,
  findFromString
}

export default findMyCombosService
