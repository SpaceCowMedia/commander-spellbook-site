/* eslint-disable unicorn/escape-case */
type Color = "yellow" | "red" | "green";

const STARTING_TIME = new Date().getTime();

const colorMap = {
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
};

export default function log(message: string, color: Color = "yellow") {
  const colorChoice = colorMap[color];
  let time = "";

  const secondsSinceProcessStarted = Math.floor(
    (new Date().getTime() - STARTING_TIME) / 1000
  );

  if (secondsSinceProcessStarted === 0) {
    time = "";
  } else if (secondsSinceProcessStarted < 60) {
    time = `${secondsSinceProcessStarted}s - `;
  } else {
    // minutes with 2 decimal places
    time = `${Math.floor((secondsSinceProcessStarted / 60) * 100) / 100}m - `;
  }
  // eslint-disable-next-line no-console
  console.info(`${time}${colorChoice}%s\x1b[0m`, message);
}
