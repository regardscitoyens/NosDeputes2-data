import path from 'path'
import { rewriteAdresses } from '../nosdeputes/rewriteAdresses'
import { CliArgs } from '../utils/cli'
import { AGENDA_14, AGENDA_15, AGENDA_16, AM030 } from '../utils/datasets'
import { getDb } from '../utils/db'
import {
  isNotNull,
  listFilesRecursively,
  readFileAsJson,
  readFilesInSubdir,
  truncateTable,
} from '../utils/utils'
import lo from 'lodash'

export async function tricoteusesInsert(args: CliArgs) {
  await insertAllActeursOfAm030(args)
  await insertAllOrganesOfAm030(args)
  await insertAllMandatsOfAm030(args)
  await insertAllFromAgendas(args)
}

function getAm030Path(args: CliArgs) {
  return path.join(args.workdir, 'tricoteuses', AM030)
}

async function insertAllActeursOfAm030(args: CliArgs) {
  const kind = 'acteurs'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, 3000)) {
    const rows = chunkOfFiles.map(filename => {
      const data = readFileAsJson(path.join(subDir, filename))
      const uid = data.uid as string
      // the mandats will be stored in their own table
      const { mandats, adresses, ...restOfData } = data
      const row = {
        uid,
        data: restOfData,
        adresses: rewriteAdresses(adresses),
      }
      return row
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(kind).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllOrganesOfAm030(args: CliArgs) {
  const kind = 'organes'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, 3000)) {
    const rows = chunkOfFiles.map(filename => {
      const data = readFileAsJson(path.join(subDir, filename))
      const uid = data.uid as string
      const row = {
        uid,
        data,
      }
      return row
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(kind).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllMandatsOfAm030(args: CliArgs) {
  const table = 'mandats'
  await truncateTable(table)
  const subDir = path.join(getAm030Path(args), 'acteurs')
  const filenames = readFilesInSubdir(subDir)
  console.log(`Extracting the mandats and inserting them into table ${table}`)

  for (const chunkOfFiles of lo.chunk(filenames, 50)) {
    const rows = chunkOfFiles.flatMap(filename => {
      const { mandats } = readFileAsJson(path.join(subDir, filename))
      const rowsFromThisFile = (mandats as any[]).map((mandat: any) => {
        const uid = mandat.uid as string
        const acteur_uid = mandat.acteurRef as string
        const organes_uids = mandat.organesRefs as string[]
        return { uid, acteur_uid, organes_uids, data: mandat }
      })
      return rowsFromThisFile
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(table).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllFromAgendas(args: CliArgs) {
  const table = 'reunions'
  await truncateTable(table)

  // There are some duplicates of reunions accross legislatures (14 and 15)
  // The versions from 15 are strictly better, they contain the xsiType and the version from 14 does not
  // So we process the latest datasets first
  const datasetsAndLegislature = [
    [AGENDA_16, 16],
    [AGENDA_15, 15],
    [AGENDA_14, 14],
  ] as const
  // And we make a note of the reunions already inserted
  const uidsInsertedSoFar: string[] = []

  for (const [dataset, legislature] of datasetsAndLegislature) {
    const datasetPath = path.join(args.workdir, 'tricoteuses', dataset)
    const files = listFilesRecursively(datasetPath)
    console.log(`Inserting these into table ${table}`)
    for (const chunkOfFiles of lo.chunk(files, 5000)) {
      const rows = chunkOfFiles
        .map(f => {
          const path_in_dataset = f
            .substring(datasetPath.length + 1)
            .replace(/\/[^/]*\.json$/, '')
          const json = readFileAsJson(f)
          const uid = json.uid as string
          if (uidsInsertedSoFar.includes(uid)) {
            // Do not insert it, we have already a better version
            return null
          }
          const row = {
            uid,
            path_in_dataset,
            legislature,
            data: json,
          }
          return row
        })
        .filter(isNotNull)
      console.log(`Inserting a chunk of ${rows.length}`)
      await getDb().insertInto(table).values(rows).execute()
      uidsInsertedSoFar.push(...rows.map(_ => _.uid))
    }
    console.log('Done')
  }
}
