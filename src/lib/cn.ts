export type ClassName = string | false | null | undefined;

export default function cn(...classes: ClassName[]): string {
  return classes.filter(Boolean).join(' ');
}
