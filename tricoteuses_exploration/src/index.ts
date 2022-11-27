import * as dotenv from "dotenv";
import { parseAndCheckArgs as parseAndCheckArguments } from "./utils/cli";
import { cloneDatasets } from "./clone";
import { createTables } from "./createtables";
import { releaseDb } from "./utils/db";

async function start() {
  const args = parseAndCheckArguments();
  dotenv.config({ path: "./.env.local" });
  if (args) {
    if (args.clone) {
      console.log("--- Cloning");
      cloneDatasets(args);
    }
    if (args.createtables) {
      console.log("--- Creating tables");
      await createTables(args);
    }
    if (args.insert) {
      console.log("--- Inserting data into tables");
      await insertData(args);
    }
    await releaseDb();
  }
  console.log("-- All done");
}

start();
