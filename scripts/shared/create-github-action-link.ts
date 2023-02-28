export default function createGithubActionLink(includeJobPath = false) {
  const baseUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/`;
  const jobPath = `jobs/${process.env.GITHUB_JOB_ID}`;

  let url = baseUrl;

  if (includeJobPath) {
    url += jobPath;
  }

  return url;
}
