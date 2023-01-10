import { Kysely, MysqlDialect } from 'kysely'
import { readFromEnv, readIntFromEnv } from './utils'
import { createPool } from 'mysql2'

let pool: Kysely<NosDeputesArchivageDatabase> | null = null

export function getPoolConfig() {
  const dbUser = readFromEnv('DB_USER')
  const dbName = readFromEnv('DB_NAME')
  const dbHost = readFromEnv('DB_HOST')
  const dbPort = readIntFromEnv('DB_PORT')
  const dbPwd = readFromEnv('DB_PWD')
  return {
    host: dbHost,
    // port: dbPort,
    user: dbUser,
    password: dbPwd,
    database: dbName,
  }
}
export function getDb(): Kysely<NosDeputesArchivageDatabase> {
  if (!pool) {
    console.log('Starting DB connection pool')
    pool = new Kysely<NosDeputesArchivageDatabase>({
      dialect: new MysqlDialect({
        pool: createPool(getPoolConfig()),
      }),
      // log: ['query'],
    })
  }
  return pool
}

// eslint-disable-next-line
export interface NosDeputesArchivageDatabase {}

export async function releaseDb() {
  if (pool) {
    console.log('Releasing DB connection pool')
    await pool.destroy()
  }
}
