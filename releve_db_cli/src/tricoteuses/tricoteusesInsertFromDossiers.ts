import lo from 'lodash'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { DOSSIERS_14, DOSSIERS_15, DOSSIERS_16 } from '../utils/datasets'
import { getDb } from '../utils/db'
import {
  isNotNull,
  listFilesRecursively,
  readFileAsJson,
  truncateTable,
} from '../utils/utils'

export async function insertFromDossiers(args: CliArgs) {
  const table = 'dossiers'
  await truncateTable(table)
  // There are some duplicates of reunions accross legislatures
  // I assume the later versions are the better ones, like for the agendas
  // TODO check that one day, are the later versions indeed better ?
  // So we process the latest datasets first
  const datasetsAndLegislature = [
    [DOSSIERS_16, 16],
    [DOSSIERS_15, 15],
    [DOSSIERS_14, 14],
  ] as const
  const uidsInsertedSoFar: string[] = []

  for (const [dataset, legislature] of datasetsAndLegislature) {
    const datasetPath = path.join(
      args.workdir,
      'tricoteuses',
      dataset,
      // there two subfolders : dossiers and documents
      'dossiers',
    )
    const files = listFilesRecursively(datasetPath)
    console.log(`Inserting these into table ${table}`)
    for (const chunkOfFiles of lo.chunk(files, 5000)) {
      const rows = chunkOfFiles
        .map(f => {
          const json = readFileAsJson(f)
          const uid = json.uid as string
          if (uidsInsertedSoFar.includes(uid)) {
            // Do not insert it, we have already a better version from a later dataset
            return null
          }
          const row = {
            uid,
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
