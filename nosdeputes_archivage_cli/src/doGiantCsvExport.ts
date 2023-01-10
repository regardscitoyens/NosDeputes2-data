import { sql } from 'kysely'
import path from 'path'
import { CliArgs } from './utils/cli'
import { getDb, getPoolConfig } from './utils/db'
import { getLegislatureDumpUrl } from './utils/legislatures'
import {
  downloadFile,
  getFilesizeInMb,
  gunzipFile,
  gzip,
  mkDirIfNeeded,
  renameFileExtension,
  rmDirIfExists,
  rmFileIfExists,
  runCommand,
  splitFileByMaxMb,
} from './utils/utils'

const MAX_FILE_SIZE_MB = 30

export async function doGiantCsvExport(args: CliArgs, legislature: number) {
  const { workdir, limitGiantExportFileSize } = args
  const dumpFilePath = await downloadDumpAndGunzipIt(workdir, legislature)
  await dropAllExistingTables()
  await importDumpInDb(dumpFilePath)
  await exportTablesFromDb(workdir, legislature, { limitGiantExportFileSize })
  // await readCsv(workdir, legislature)
}

async function downloadDumpAndGunzipIt(workdir: string, legislature: number) {
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

export async function importDumpInDb(dumpFilePath: string) {
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
  if (tables.length > 0) {
    console.log(`Dropping ${tables.length} existing tables`)
    for (const table of tables) {
      await sql`DROP TABLE ${sql.raw(table)}`.execute(getDb())
    }
  }
}

async function listTables(): Promise<string[]> {
  const tables = (
    await sql<{ [k: string]: string }>`SHOW TABLES`.execute(getDb())
  ).rows.map(row => Object.values(row)[0])
  return tables
}

async function exportTablesFromDb(
  workdir: string,
  legislature: number,
  { limitGiantExportFileSize }: { limitGiantExportFileSize: boolean },
) {
  const tables = await listTables()
  const exportFolder = path.join(workdir, 'giant_export', `L${legislature}`)
  rmDirIfExists(exportFolder)
  mkDirIfNeeded(exportFolder)
  for (const table of tables) {
    const tableFolder = path.join(exportFolder, table)
    mkDirIfNeeded(tableFolder)
    const { host, user, password, database } = getPoolConfig()
    function buildCommand(hidePassword: boolean) {
      // We use , as a separator
      // We use " to wrap values
      // We use \ as the escape character (and not ", which is the most common for CSV)
      return `mysqldump -u ${user} --password=${
        hidePassword ? 'XXX' : password
      } -h ${host} --tab=${tableFolder} --fields-terminated-by=',' --fields-enclosed-by='"' --fields-escaped-by='\\'  ${database} ${table}`
    }
    runCommand(buildCommand(false), buildCommand(true))
    renameFileExtension(path.join(tableFolder, `${table}.txt`), 'csv')

    const csvFile = path.join(tableFolder, `${table}.csv`)
    if (
      limitGiantExportFileSize &&
      getFilesizeInMb(csvFile) > MAX_FILE_SIZE_MB
    ) {
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
