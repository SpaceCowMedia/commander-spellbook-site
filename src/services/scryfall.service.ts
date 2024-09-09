import requestService from './api.service';
import { AutoCompleteOption } from '../components/advancedSearch/AutocompleteInput/AutocompleteInput';

let cachedAutoCompleteOptions: AutoCompleteOption[] | null = null;
const getNameAutocomplete = async (): Promise<AutoCompleteOption[]> => {
  if (cachedAutoCompleteOptions) return cachedAutoCompleteOptions;
  const res = await requestService.get(
    'https://api.scryfall.com/catalog/card-names',
  );
  cachedAutoCompleteOptions = res.data.map((name: string) => {
    const splitName = name.split(' // ')[0];
    return { value: splitName, label: splitName };
  });
  return cachedAutoCompleteOptions || [];
};

const CardService = {
  getNameAutocomplete,
};

export default CardService;
