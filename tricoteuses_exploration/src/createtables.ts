import { sql } from "kysely";
import { CliArgs } from "./utils/cli";
import { getDb } from "./utils/db";
import fs from "fs";

export async function createTables(args: CliArgs) {
  const sqlFile = "./sql/db_tables.sql";
  console.log(`Running SQL file ${sqlFile}`);
  const sqlCommands = fs.readFileSync(sqlFile, {
    encoding: "utf8",
  });
  await sql.raw(sqlCommands).execute(getDb());
  console.log("Done");
}
