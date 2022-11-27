import { Kysely, PostgresDialect } from "kysely";
import { readFromEnv, readIntFromEnv } from "./utils";
import { Pool } from "pg";

export type DbConnectionPool = Kysely<NosDeputesDatabase>;

console.log("Starting DB connection pool");
export const db: DbConnectionPool = new Kysely<NosDeputesDatabase>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: readFromEnv("DB_HOST"),
      port: readIntFromEnv("DB_PORT"),
      user: readFromEnv("DB_USER"),
      password: readFromEnv("DB_PWD"),
      database: readFromEnv("DB_NAME"),
    }),
  }),
  log: ["query"],
});

export interface NosDeputesDatabase {
  // TBD
}
