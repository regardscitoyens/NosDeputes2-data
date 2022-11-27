import * as dotenv from "dotenv";
import { parseAndCheckArgs as parseAndCheckArguments } from "./cli";
import { cloneDatasets } from "./clone";
import { createTables } from "./createtables";

function start() {
  dotenv.config({ path: "./.env.local" });
  const args = parseAndCheckArguments();
  if (args) {
    if (args.clone) {
      console.log("--- Cloning");
      cloneDatasets(args);
    }
    if (args.createtables) {
      console.log("--- Creating Tables");
      createTables(args);
    }
  }
}

start();
