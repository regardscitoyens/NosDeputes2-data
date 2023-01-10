import { readFileAsString } from './utils'
import * as csv from 'csv'

export async function readCsv(file: string): Promise<any[]> {
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
          resolve(records)
        }
      },
    )
  })
}
