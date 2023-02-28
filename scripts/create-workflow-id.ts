// this script is only used in github actions workflow
// to create a unique id for caching the download data script

import saveGithubOutput from "./shared/save-github-output";

console.log(process.env.GITHUB_RUN_ID, process.env.GITHUB_RUN_ATTEMPT);

saveGithubOutput(
  "uuid",
  process.env.GITHUB_RUN_ID + "-" + process.env.GITHUB_RUN_ATTEMPT
);
