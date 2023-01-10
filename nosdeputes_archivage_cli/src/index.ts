import * as dotenv from 'dotenv'
import { processLegislature } from './processLegislature'
import { parseAndCheckArgs as parseAndCheckArguments } from './utils/cli'
import { releaseDb } from './utils/db'

async function start() {
  const args = parseAndCheckArguments()
  dotenv.config({ path: './.env.local' })
  if (args) {
    for (const legislature of args.legislatures) {
      console.log(`--- Starting the process for legislature ${legislature}`)
      await processLegislature(args.workdir, legislature)
      console.log(`--- Done for this legislature`)
    }
    await releaseDb()
  }
  console.log('-- All done')
}

void start()
