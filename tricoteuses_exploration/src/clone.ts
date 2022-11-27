import { CliArgs } from "./utils/cli";
import { execSync } from "child_process";
import path from "path";
import { datasetsForRegardsCitoyens } from "./utils/datasets";
import fs from "fs";

function runCmd(cmd: string) {
  console.log(`>> ${cmd}`);
  execSync(cmd, {
    //env: process.env,
    encoding: "utf-8",
    stdio: ["ignore", "ignore", "pipe"],
  });
}

function rmDirIfExists(dir: string) {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning directory ${dir} and all its contents`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function cloneDatasets({ workdir }: CliArgs) {
  const datasets = datasetsForRegardsCitoyens;
  console.log(`Cloning ${datasets.length} dataset(s) into ${workdir}`);
  datasets.forEach((name) => {
    const targetDir = path.join(workdir, name);
    rmDirIfExists(targetDir);
    runCmd(
      `git clone https://git.en-root.org/tricoteuses/data/assemblee-nettoye/${name}_nettoye.git ${targetDir}`
    );
  });
  console.log("Done");
}
