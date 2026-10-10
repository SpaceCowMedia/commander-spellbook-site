/* A card a template stands for, trimmed to what a replacement list shows, so that a page of them can
   be stored and read back as JSON. */
export interface ReplacementCard {
  id: string;
  name: string;
  images: string[];
  spoiler: boolean;
}

export interface ReplacementsPage {
  results: ReplacementCard[];
  page: number;
  nextPage?: number;
  count?: number;
}
