import fs from "fs";

const GITHUB_OUTPUT_LOCATION = process.env.GITHUB_OUTPUT;

export default function saveGithubOutput(key: string, value: string) {
  if (!GITHUB_OUTPUT_LOCATION) {
    // eslint-disable-next-line no-console
    console.error(
      "Could not find the GITHUB_OUTPUT file. Not in the Github Actions Environment. Skipping step to write to Github Output."
    );
    return;
  }

  const GITHUB_OUTPUT = fs.readFileSync(GITHUB_OUTPUT_LOCATION, "utf8");

  fs.writeFileSync(
    GITHUB_OUTPUT_LOCATION,
    `${GITHUB_OUTPUT}
${key}=${value}`
  );
}
