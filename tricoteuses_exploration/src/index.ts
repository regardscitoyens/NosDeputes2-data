import * as dotenv from "dotenv";
import { parseAndCheckArgs as parseAndCheckArguments } from "./cli";
import { cloneDatasets } from "./clone";
import { createTables } from "./createtables";

function start() {
  const args = parseAndCheckArguments();
  dotenv.config({ path: "./.env.local" });
  if (args) {
    if (args.clone) {
      console.log("--- Cloning");
      cloneDatasets(args);
    }
    if (args.createtables) {
      console.log("--- Creating tables");
      createTables(args);
    }
  }
}

start();
