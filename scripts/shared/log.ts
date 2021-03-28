/* eslint-disable unicorn/escape-case */
type Color = "yellow" | "red" | "green";

const colorMap = {
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
};

export default function log(message: string, color: Color = "yellow") {
  const colorChoice = colorMap[color];

  // eslint-disable-next-line no-console
  console.info(`${colorChoice}%s\x1b[0m`, message);
}
