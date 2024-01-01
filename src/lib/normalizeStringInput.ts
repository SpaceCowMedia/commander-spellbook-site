export default function normalizeStringInput(str: string): string {
  return str.normalize("NFD")
    .toLowerCase()
    .replace(/[^a-zA-Z 0-9{}]+/g, "")
    .trim();
}
