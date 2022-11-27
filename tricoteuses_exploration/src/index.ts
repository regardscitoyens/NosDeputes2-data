import { parseAndCheckArgs as parseAndCheckArguments } from "./cli";

function start() {
  const args = parseAndCheckArguments();
  if (args) {
    console.log(args);
  }
}

start();

// TODO clone the _nettoye repo

// TODO script to create the DB (tables etc.) (configure.ts)

// TODO populate the DB (update_db.ts)

// TODO live update of amendments ???
