import * as dotenv from 'dotenv'
import { parseAndCheckArgs as parseAndCheckArguments } from './utils/cli'
import { tricoteusesClone } from './tricoteuses/tricoteusesClone'
import { createTables } from './createtables'
import { releaseDb } from './utils/db'
import { tricoteusesInsert } from './tricoteuses/tricoteusesInsert'
import { sandbox } from './sandbox'
import { nosdeputesFetch } from './nosdeputes/nosdeputesFetch'

async function start() {
  const args = parseAndCheckArguments()
  dotenv.config({ path: './.env.local' })
  if (args) {
    if (args.createtables) {
      console.log('--- Creating SQL tables')
      await createTables(args)
    }
    if (args.tricoteusesClone) {
      console.log('--- Cloning datasets from Les Tricoteuses')
      tricoteusesClone(args)
    }
    if (args.tricoteusesInsert) {
      console.log(
        '--- Inserting data from Les Tricoteuses datasets into the tables',
      )
      await tricoteusesInsert(args)
    }
    if (args.nosdeputesFetch) {
      console.log('--- Downloading data from NosDeputes')
      await nosdeputesFetch(args)
    }
    if (args.tricoteusesInsert) {
      console.log('--- Inserting data from NosDeputes datasets into the tables')
      // await tricoteusesInsert(args)
    }
    if (args.sandbox) {
      console.log('--- Sandbox')
      await sandbox(args)
    }
    await releaseDb()
  }
  console.log('-- All done')
}

start()
