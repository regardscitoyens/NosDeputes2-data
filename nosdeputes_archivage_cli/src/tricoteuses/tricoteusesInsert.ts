import { CliArgs } from '../utils/cli'
import {
  insertReunions,
  insertSessionsUsingReunions,
} from './tricoteusesInsertFromAgendas'
import {
  insertAllActeursOfAm030,
  insertAllMandatsOfAm030,
  insertAllOrganesOfAm030,
} from './tricoteusesInsertFromAm030'
import { insertFromDossiers } from './tricoteusesInsertFromDossiers'
import { insertFromScrutins } from './tricoteusesInsertFromScrutins'

export async function tricoteusesInsert(args: CliArgs) {
  await insertAllActeursOfAm030(args)
  await insertAllMandatsOfAm030(args)
  await insertAllOrganesOfAm030(args)
  await insertReunions(args)
  await insertSessionsUsingReunions()
  await insertFromDossiers(args)
  await insertFromScrutins(args)
}
