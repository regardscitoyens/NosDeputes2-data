import path from "path";
import { CliArgs } from "./utils/cli";
import { AM030 } from "./utils/datasets";
import fs from "fs";
export async function insertData(args: CliArgs) {
  console.log("TBD....");

  const dataset = AM030;
  const acteursDir = path.join(args.workdir, `${dataset}_nettoye`, "acteurs");

    

}
