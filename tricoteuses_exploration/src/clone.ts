import { CliArgs } from "./cli";
import { execSync } from "child_process";
import path from "path";

function runCmd(cmd: string) {
  console.log(`>> ${cmd}`);
  execSync(cmd, {
    //env: process.env,
    encoding: "utf-8",
    stdio: ["ignore", "ignore", "pipe"],
  });
}

export function clone({ workdir }: CliArgs) {
  const datasets = datasetsForRegardsCitoyens;
  console.log(`Cloning ${datasets.length} into ${workdir}`);
  datasets.forEach((dataset) => {
    const targetFolder = path.join(workdir, dataset);
    runCmd(
      `git clone https://git.en-root.org/tricoteuses/data/assemblee-nettoye/${datasetName}_nettoye.git ${targetFolder}`
    );
  });
  console.log("Finishing cloning");
}
