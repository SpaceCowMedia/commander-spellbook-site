// letters that NFD does not decompose, spelled out as the backend does, so "aether" still finds "Æther"
const TRANSLITERATIONS: Record<string, string> = {
  æ: 'ae',
  œ: 'oe',
  ß: 'ss',
  ø: 'o',
  ð: 'd',
  đ: 'd',
  þ: 'th',
  ł: 'l',
  ħ: 'h',
  ı: 'i',
};

export default function normalizeStringInput(str: string): string {
  return str
    .normalize('NFD')
    .toLowerCase()
    .replace(/[æœßøðđþłħı]/g, (letter) => TRANSLITERATIONS[letter])
    .replace(/[^a-zA-Z 0-9{}]+/g, '')
    .trim();
}
