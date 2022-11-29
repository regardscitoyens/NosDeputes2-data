import _ from 'lodash'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { getDb } from '../utils/db'
import { readFileAsJson } from '../utils/utils'

type NosDeputesJsonFile = {
  id: number
  id_an: string
  slug: string
  legislature: number
}[]

export async function nosdeputesInsert(args: CliArgs) {
  const filepath = path.join(args.workdir, 'nosdeputes', 'deputes.json')
  console.log(`Reading file ${filepath}`)
  const deputes = readFileAsJson(filepath) as NosDeputesJsonFile
  const table = 'nosdeputes_deputes'
  console.log(`Inserting ${deputes.length} rows into ${table}`)

  for (const versionsOfSameDepute of Object.values(
    _.groupBy(deputes, d => d.id_an),
  )) {
    // In NosDeputes, the same depute can exist in different legislatures
    // and have different slugs
    // Exemple : yannick-favennec => became yannick-favennec-becot
    // Exemple : christine-cloarec => became christine-le-nabour
    // For these cases we will always prefer the most recent slug
    const latestVersion = _.sortBy(versionsOfSameDepute, d => -d.legislature)[0]
    const { slug, id_an } = latestVersion
    await getDb()
      .insertInto(table)
      .values({
        uid: `PA${id_an}`,
        slug,
      })
      .execute()
  }
  console.log('Done')
}
