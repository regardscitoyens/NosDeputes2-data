import path from 'path'
import { CliArgs } from './utils/cli'
import { AM030 } from './utils/datasets'
import fs from 'fs'
import { sql } from 'kysely'
import { getDb } from './utils/db'

export async function insertData(args: CliArgs) {
  await insertAllActeursOfAm030(args)
  await insertAllOrganesOfAm030(args)
  await insertAllMandatsOfAm030(args)
}

async function insertAllActeursOfAm030(args: CliArgs) {
  const dataset = AM030
  const kind = 'acteurs'
  truncateTable(kind)
  const subDir = path.join(args.workdir, `${dataset}`, kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const filename of filenames) {
    const data = readFileAsJson(path.join(subDir, filename))
    const uid = data.uid as string
    // the mandats will be stored in their own table
    const { mandats, ...restOfData } = data
    await getDb()
      .insertInto(kind)
      .values({
        uid,
        data: restOfData,
      })
      .execute()
  }
  console.log('Done')
}

async function insertAllOrganesOfAm030(args: CliArgs) {
  const dataset = AM030
  const kind = 'organes'
  truncateTable(kind)
  const subDir = path.join(args.workdir, `${dataset}`, kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const filename of filenames) {
    const data = readFileAsJson(path.join(subDir, filename))
    const uid = data.uid as string
    await getDb()
      .insertInto(kind)
      .values({
        uid,
        data: data,
      })
      .execute()
  }
  console.log('Done')
}

async function insertAllMandatsOfAm030(args: CliArgs) {
  const dataset = AM030
  const table = 'mandats'
  truncateTable(table)
  const subDir = path.join(args.workdir, `${dataset}`, 'acteurs')
  const filenames = readFilesInSubdir(subDir)
  console.log(`Extracting the mandats and inserting them into table ${table}`)
  for (const filename of filenames) {
    const { mandats } = readFileAsJson(path.join(subDir, filename))
    for (const mandat of mandats) {
      const uid = mandat.uid as string
      const acteur_uid = mandat.acteurRef as string
      const organes_uids = mandat.organesRefs as string[]
      await getDb()
        .insertInto(table)
        .values({
          uid,
          acteur_uid,
          organes_uids,
          data: mandat,
        })
        .execute()
    }
  }
  console.log('Done')
}

function readFilesInSubdir(subDir: string): string[] {
  console.log(`Reading files in ${subDir}`)
  const filenames = fs.readdirSync(subDir)
  console.log(`${filenames.length} files found`)
  return filenames
}

async function truncateTable(tableName: string) {
  console.log(`Emptying ${tableName} table`)
  await sql`TRUNCATE TABLE ${sql.raw(tableName)}`.execute(getDb())
}

function readFileAsJson(filePath: string): any {
  return JSON.parse(
    fs.readFileSync(filePath, {
      encoding: 'utf8',
    }),
  )
}
