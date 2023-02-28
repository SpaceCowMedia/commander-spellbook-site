export default function createGithubActionLink(path = "") {
  return `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/${path}`;
}
