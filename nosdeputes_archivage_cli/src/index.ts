import * as dotenv from 'dotenv'
import { fetchDumps } from './fetchDumps'
import { sandbox } from './sandbox'
import { parseAndCheckArgs as parseAndCheckArguments } from './utils/cli'
import { releaseDb } from './utils/db'

async function start() {
  const args = parseAndCheckArguments()
  dotenv.config({ path: './.env.local' })
  if (args) {
    if (args.fetchDumps) {
      console.log('--- Fetching the dumps')
      await fetchDumps(args)
    }
    if (args.sandbox) {
      console.log('--- Sandbox')
      await sandbox(args)
    }
    await releaseDb()
  }
  console.log('-- All done')
}

void start()
