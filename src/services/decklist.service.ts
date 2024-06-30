import { Url } from "url";
import requestService from "./request.service"

export type ParsedDeckResult = {
    main: string[],
    commanders: string[],
}

export type ErrorResult = {
    error: string,
}

const getCardsFromUrl = async (url: string): Promise<ParsedDeckResult> => {
    return await requestService.get<ParsedDeckResult>(`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/card-list-from-url?url=${encodeURIComponent(url)}`);
}

const decklistService = {
    getCardsFromUrl: getCardsFromUrl,
}

export default decklistService
