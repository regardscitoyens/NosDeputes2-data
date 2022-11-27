import { parseAndCheckArgs as parseAndCheckArguments } from "./cli";
import { cloneDatasets } from "./clone";

function start() {
  const args = parseAndCheckArguments();
  if (args) {
    if (args.clone) {
      cloneDatasets(args);
    }
  }
}

start();

// TODO clone the _nettoye repo

// TODO script to create the DB (tables etc.) (configure.ts)

// TODO populate the DB (update_db.ts)

// TODO live update of amendments ???
