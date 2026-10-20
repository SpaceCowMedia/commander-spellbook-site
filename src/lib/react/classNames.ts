export type ClassName = string | false | null | undefined;

export default function classNames(...classes: ClassName[]): string {
  return classes.filter(Boolean).join(' ');
}
