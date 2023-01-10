import { readFileAsString } from './utils/utils'
import * as csv from 'csv'

export async function readCsv(workdir: string, legislature: number) {
  const file = `${workdir}/export/L${legislature}/scrutin/scrutin.txt`
  const fileContent = readFileAsString(file)

  return new Promise((resolve, reject) => {
    csv.parse(
      fileContent,
      {
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
