import requestService from "./request.service"

type MoxfieldCardCard = {
    name: string,
}

type MoxfieldCard = {
    quantity: number,
    card: MoxfieldCardCard,
}

type MoxfieldDeck = {
    id: string,
    name: string,
    mainboard: MoxfieldCard[],
    commanders: MoxfieldCard[],
}

const getCardsFromId = async (id: string): Promise<{commanderList: string[], cards: string[]}> => {
    const res = await requestService.get<MoxfieldDeck>(`https://api.moxfield.com/v2/decks/all/${id}`);
    const commanderList = res.commanders.map(card => card.card.name);
    const cards = res.mainboard.map(card => card.card.name);
    return {commanderList, cards};
}

const moxfieldService = {
    getCardsFromId,
}

export default moxfieldService
