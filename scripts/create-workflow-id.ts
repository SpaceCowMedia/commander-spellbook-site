// this script is only used in github actions workflow
// to create a unique id for caching the download data script

import saveGithubOutput from "./shared/save-github-output";

saveGithubOutput(
  "uuid",
  process.env.GITHUB_RUN_ID + "-" + process.env.GITHUB_RUN_ATTEMPT
);
