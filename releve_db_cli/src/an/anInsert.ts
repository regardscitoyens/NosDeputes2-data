import lo from 'lodash'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { getDb } from '../utils/db'
import {
  listFilesRecursively,
  readFileAsXml,
  truncateTable,
} from '../utils/utils'
export async function anInsert(args: CliArgs) {
  const table = 'comptesrendus'
  await truncateTable(table)

  const datasets = ['debats16', 'debats15'] as const

  for (const dataset of datasets) {
    const datasetPath = path.join(args.workdir, 'an', dataset)
    const files = listFilesRecursively(datasetPath)
    console.log(`Inserting these into table ${table}`)

    for (const chunkOfFiles of lo.chunk(files, 10)) {
      const rows = chunkOfFiles.map(filePath => {
        const data = readFileAsXml(filePath).compteRendu
        const uid = data.uid
        return { data, uid }
      })
      console.log(`Inserting a chunk of ${rows.length}`)
      await getDb().insertInto(table).values(rows).execute()
    }
    console.log('Done')
  }
}
