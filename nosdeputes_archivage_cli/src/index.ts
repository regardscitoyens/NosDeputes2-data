import * as dotenv from 'dotenv'
import { doGiantCsvExport } from './doGiantCsvExport'
import { doSelectiveExport } from './doSelectiveExport'
import { parseAndCheckArgs as parseAndCheckArguments } from './utils/cli'
import { releaseDb } from './utils/db'

async function start() {
  const args = parseAndCheckArguments()
  dotenv.config({ path: './.env.local' })
  if (args) {
    if (args.doGiantExport) {
      for (const legislature of args.legislatures) {
        console.log(
          `--- Starting the giant export for legislature ${legislature}`,
        )
        await doGiantCsvExport(args, legislature)
        console.log(`--- Done for this legislature`)
      }
    }
    if (args.doSelectiveExport) {
      for (const legislature of args.legislatures) {
        console.log(
          `--- Starting the selective export for legislature ${legislature}`,
        )
        await doSelectiveExport(args, legislature)
        console.log(`--- Done for this legislature`)
      }
    }
    await releaseDb()
  }
  console.log('-- All done')
}

void start()
