import requestService from "./request.service";

type ArchidektCardCardOracleCard = {
    name: string,
}

type ArchidektCardCard = {
    oracleCard: ArchidektCardCardOracleCard,
}

type ArchidektCard = {
    quantity: number,
    card: ArchidektCardCard,
    categories: string[],
}

type ArchidektDeck = {
    id: string,
    name: string,
    cards: ArchidektCard[],
}

const getCardsFromId = async (id: string): Promise<{commanderList: string[], cards: string[]}> => {
    const res = await requestService.get<ArchidektDeck>(`https://archidekt.com/api/decks/${id}/`);
    const commanderList = res.cards.filter(card => card.categories.includes('Commander')).map(card => card.card.oracleCard.name);
    const cards = res.cards.filter(card => 
        !card.categories.includes('Commander')
        && !card.categories.includes('Sideboard')
        && !card.categories.includes('Maybeboard')
        && !card.categories.includes('Considering')
    ).map(card => card.card.oracleCard.name);
    return {commanderList, cards};
}

const archidektService = {
    getCardsFromId,
}

export default archidektService
