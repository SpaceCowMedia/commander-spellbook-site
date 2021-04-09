export default function normalizeCardName(cardName: string): string {
  return (
    cardName
      // * use only lowercase letters to avoid inconsistent capitalization
      .toLowerCase()
      // * split on " // " to use only the first piece of any card name
      //   with two sides/parts
      .split(" // ")[0]
      // * remove anything in the card name that isn't a letter, number or space
      //   to take care of inconsistent punctuation
      .replace(/[^\w\s]/g, "")
  );
}
