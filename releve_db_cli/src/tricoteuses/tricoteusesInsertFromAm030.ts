import lo from 'lodash'
import path from 'path'
import { rewriteAdresses } from '../utils/rewriteAdresses'
import { CliArgs } from '../utils/cli'
import { AM030 } from '../utils/tricoteusesDatasets'
import { getDb } from '../utils/db'
import {
  readFileAsJson,
  readFilesInSubdir,
  truncateTable,
  withChunkFactor,
} from '../utils/utils'

export async function insertAllActeursOfAm030(args: CliArgs) {
  const kind = 'acteurs'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, withChunkFactor(3000))) {
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

export async function insertAllOrganesOfAm030(args: CliArgs) {
  const kind = 'organes'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, withChunkFactor(3000))) {
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

export async function insertAllMandatsOfAm030(args: CliArgs) {
  const table = 'mandats'
  await truncateTable(table)
  const subDir = path.join(getAm030Path(args), 'acteurs')
  const filenames = readFilesInSubdir(subDir)
  console.log(`Extracting the mandats and inserting them into table ${table}`)

  for (const chunkOfFiles of lo.chunk(filenames, withChunkFactor(50))) {
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

function getAm030Path(args: CliArgs) {
  return path.join(args.workdir, 'tricoteuses', AM030)
}
