import path from 'path'
import { getLegislatureDumpUrl } from './utils/legislatures'
import {
  downloadFile,
  gunzipFile,
  mkDirIfNeeded,
  readFileAsJson,
  readFileAsString,
  rmDirIfExists,
  rmFileIfExists,
  timeoutPromise,
} from './utils/utils'
import * as csv from 'csv'
import cp from 'child_process'
import { getDb, getPoolConfig } from './utils/db'
import { sql } from 'kysely'
import lo from 'lodash'
import { knownTables } from './utils/tables'

export async function processLegislature(workdir: string, legislature: number) {
  // const dumpFilePath = await fetchDump(workdir, legislature)
  const dumpFilePath = `./tmp/dumps/L${legislature}.sql`
  await dropAllExistingTables()
  await importDump(dumpFilePath)
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

function runCommand(command: string, commandToLog?: string) {
  console.log('> Running command', commandToLog ?? command)
  cp.execSync(command, { stdio: 'inherit' })
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
