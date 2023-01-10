import * as csv from 'csv'
import { sql } from 'kysely'
import path from 'path'
import { getDb, getPoolConfig } from './utils/db'
import { getLegislatureDumpUrl } from './utils/legislatures'
import {
  downloadFile,
  getFilesizeInMb,
  gunzipFile,
  gzip,
  mkDirIfNeeded,
  readFileAsString,
  renameFileExtension,
  rmDirIfExists,
  rmFileIfExists,
  runCommand,
  splitFileByMaxMb,
} from './utils/utils'

const MAX_FILE_SIZE_MB = 30

export async function processLegislature(workdir: string, legislature: number) {
  // const dumpFilePath = await fetchDump(workdir, legislature)
  // const dumpFilePath = `./tmp/dumps/L${legislature}.sql`
  // await dropAllExistingTables()
  // await importDump(dumpFilePath)
  await exportTables(workdir, legislature)
  // await readCsv(workdir, legislature)
}

async function fetchDump(workdir: string, legislature: number) {
  const dumpsDir = path.join(workdir, 'dumps')
  mkDirIfNeeded(dumpsDir)
  const url = getLegislatureDumpUrl(legislature)
  const filePath = path.join(dumpsDir, `L${legislature}.sql.gz`)
  await downloadFile(url, filePath)
  const filePathUnzipped = path.join(dumpsDir, `L${legislature}.sql`)
  await gunzipFile(filePath, filePathUnzipped)
  rmFileIfExists(filePath)
  return filePathUnzipped
}

export async function importDump(dumpFilePath: string) {
  const { host, user, password, database } = getPoolConfig()

  function buildCommand(hidePassword: boolean) {
    // note : here I don't use the port, I was not able to make it work with the host "localhost"
    return `mysql -u ${user} --password=${
      hidePassword ? 'XXX' : password
    } -h ${host} ${database} < ${dumpFilePath}`
  }

  runCommand(buildCommand(false), buildCommand(true))
}

async function dropAllExistingTables() {
  const tables = await listTables()
  for (const table of tables) {
    console.log(`Dropping existing table ${table}`)
    await sql`DROP TABLE ${sql.raw(table)}`.execute(getDb())
  }
}

async function listTables(): Promise<string[]> {
  const tables = (
    await sql<{ [k: string]: string }>`SHOW TABLES`.execute(getDb())
  ).rows.map(row => Object.values(row)[0])
  return tables
}

async function exportTables(workdir: string, legislature: number) {
  const tables = await listTables()
  const exportFolder = path.join(workdir, 'export', `L${legislature}`)
  rmDirIfExists(exportFolder)
  mkDirIfNeeded(exportFolder)
  for (const table of tables) {
    const tableFolder = path.join(exportFolder, table)
    mkDirIfNeeded(tableFolder)
    const { host, user, password, database } = getPoolConfig()
    function buildCommand(hidePassword: boolean) {
      // return `mysqldump -u ${user} --password=${
      //   hidePassword ? 'XXX' : password
      // } -h ${host} --tab=${tableFolder} ${database} ${table}`
      return `mysqldump -u ${user} --password=${
        hidePassword ? 'XXX' : password
      } -h ${host} --tab=${tableFolder} --fields-terminated-by=',' --fields-enclosed-by='"' --fields-escaped-by='\\'  ${database} ${table}`
    }
    runCommand(buildCommand(false), buildCommand(true))
    renameFileExtension(path.join(tableFolder, `${table}.txt`), 'csv')

    const csvFile = path.join(tableFolder, `${table}.csv`)
    if (getFilesizeInMb(csvFile) > MAX_FILE_SIZE_MB) {
      const gzippedFile = path.join(tableFolder, `${table}.csv.gzip`)
      await gzip(csvFile, gzippedFile)
      rmFileIfExists(csvFile)
      if (getFilesizeInMb(gzippedFile) > MAX_FILE_SIZE_MB) {
        await splitFileByMaxMb(gzippedFile, MAX_FILE_SIZE_MB)
        rmFileIfExists(csvFile)
      }
    }
  }
}

async function readCsv(workdir: string, legislature: number) {
  const file = `${workdir}/export/L${legislature}/scrutin/scrutin.txt`
  const fileContent = readFileAsString(file)

  return new Promise((resolve, reject) => {
    csv.parse(
      fileContent,
      {
        // delimiter: ',',
        escape: '\\',
      },
      (err, records) => {
        if (err) reject(err)
        else {
          console.log(records)
          resolve(records)
        }
      },
    )
  })
}
