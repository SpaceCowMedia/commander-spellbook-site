import { execSync } from "child_process";

export default function getCurrentGitSha() {
  return execSync("git rev-parse HEAD").toString().trim();
}
