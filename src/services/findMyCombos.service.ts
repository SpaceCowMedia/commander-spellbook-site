import requestService from "./request.service";
import {convertDecklistToArray} from "../lib/decklist-parser";
import {FindMyCombosResponseType} from "../types/findMyCombos";

const FIND_MY_COMBOS_ENDPOINT = `https://${process.env.EDITOR_BACKEND_URL}/find-my-combos`

const findFromLists = async (commanders: string[], cards: string[], next?: string): Promise<FindMyCombosResponseType> => {
  return requestService.post(next || FIND_MY_COMBOS_ENDPOINT, { commanders, main: cards })
}

const findFromString = async (decklist: string, commanderList: string, next?: string): Promise<FindMyCombosResponseType> => {
  return findFromLists(convertDecklistToArray(commanderList), convertDecklistToArray(decklist), next)
}

const findMyCombosService = {
  findFromLists,
  findFromString,
}

export default findMyCombosService
