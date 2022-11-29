import * as dotenv from 'dotenv'
import { parseAndCheckArgs as parseAndCheckArguments } from './utils/cli'
import { cloneDatasets } from './clone'
import { createTables } from './createtables'
import { releaseDb } from './utils/db'
import { insertData } from './insert'
import { sandbox } from './sandbox'

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
      cloneDatasets(args)
    }
    if (args.tricoteusesInsert) {
      console.log(
        '--- Inserting data from Les Tricoteuses datasets into the tables',
      )
      await insertData(args)
    }
    if (args.nosdeputesFetch) {
      console.log('--- Downloading data from NosDeputes')
      cloneDatasets(args)
    }
    if (args.tricoteusesInsert) {
      console.log('--- Inserting data from NosDeputes datasets into the tables')
      await insertData(args)
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
