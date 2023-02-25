import fs from "fs";
import saveGithubOutput from "./shared/save-github-output";

let shouldDeploy = "NO";

const changelog = JSON.parse(
  fs.readFileSync("./frontend/static/changelog.json", "utf8")
);

if (
  changelog.addedCombos.length > 0 ||
  changelog.deletedCombos.length > 0 ||
  changelog.updatedCombos.length > 0
) {
  shouldDeploy = "YES";
}

saveGithubOutput("should_deploy", shouldDeploy);
