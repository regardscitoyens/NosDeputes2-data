import { CliArgs } from '../utils/cli'
import { insertReunionsAndSesssionsFromAgendas } from './tricoteusesInsertFromAgendas'
import { insertActeursOrganesMandatsOfAm030 } from './tricoteusesInsertFromAm030'

export async function tricoteusesInsert(args: CliArgs) {
  await insertActeursOrganesMandatsOfAm030(args)
  await insertReunionsAndSesssionsFromAgendas(args)
}
