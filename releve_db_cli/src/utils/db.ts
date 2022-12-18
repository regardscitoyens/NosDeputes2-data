import { Kysely, PostgresDialect } from 'kysely'
import { readFromEnv, readIntFromEnv } from './utils'
import { Pool } from 'pg'
import { Adresses } from '../nosdeputes/rewriteAdresses'

let pool: Kysely<NosDeputesDatabase> | null = null

export function getDb(): Kysely<NosDeputesDatabase> {
  if (!pool) {
    console.log('Starting DB connection pool')
    pool = new Kysely<NosDeputesDatabase>({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: readFromEnv('DB_HOST'),
          port: readIntFromEnv('DB_PORT'),
          user: readFromEnv('DB_USER'),
          password: readFromEnv('DB_PWD'),
          database: readFromEnv('DB_NAME'),
        }),
      }),
      // log: ["query"],
    })
  }
  return pool
}

export interface NosDeputesDatabase {
  acteurs: {
    uid: string
    data: unknown
    adresses: Adresses
  }
  organes: {
    uid: string
    data: unknown
  }
  mandats: {
    uid: string
    data: unknown
    acteur_uid: string
    organes_uids: string[]
  }
  reunions: {
    uid: string
    data: unknown
    path_in_dataset: string
  }
  sessions: {
    uid: string
    legislature: number
    start_date: Date
    end_date: Date
  }
  nosdeputes_deputes: {
    uid: string
    slug: string
  }
}

export async function releaseDb() {
  if (pool) {
    console.log('Releasing DB connection pool')
    await pool.destroy()
  }
}
