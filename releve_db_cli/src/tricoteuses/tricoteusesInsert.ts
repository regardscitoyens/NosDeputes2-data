import path from 'path'
import { rewriteAdresses } from '../nosdeputes/rewriteAdresses'
import { CliArgs } from '../utils/cli'
import { AGENDA_14, AGENDA_15, AGENDA_16, AM030 } from '../utils/datasets'
import { getDb } from '../utils/db'
import {
  isNotNull,
  listFilesRecursively,
  readFileAsJson,
  readFilesInSubdir,
  truncateTable,
} from '../utils/utils'
import lo from 'lodash'
import { sql } from 'kysely'

export async function tricoteusesInsert(args: CliArgs) {
  await insertAllActeursOfAm030(args)
  await insertAllOrganesOfAm030(args)
  await insertAllMandatsOfAm030(args)
  await insertAllFromAgendas(args)
  await insertSessionsUsingReunions()
}

function getAm030Path(args: CliArgs) {
  return path.join(args.workdir, 'tricoteuses', AM030)
}

async function insertAllActeursOfAm030(args: CliArgs) {
  const kind = 'acteurs'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, 3000)) {
    const rows = chunkOfFiles.map(filename => {
      const data = readFileAsJson(path.join(subDir, filename))
      const uid = data.uid as string
      // the mandats will be stored in their own table
      const { mandats, adresses, ...restOfData } = data
      const row = {
        uid,
        data: restOfData,
        adresses: rewriteAdresses(adresses),
      }
      return row
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(kind).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllOrganesOfAm030(args: CliArgs) {
  const kind = 'organes'
  await truncateTable(kind)
  const subDir = path.join(getAm030Path(args), kind)
  const filenames = readFilesInSubdir(subDir)
  console.log(`Inserting these into table ${kind}`)
  for (const chunkOfFiles of lo.chunk(filenames, 3000)) {
    const rows = chunkOfFiles.map(filename => {
      const data = readFileAsJson(path.join(subDir, filename))
      const uid = data.uid as string
      const row = {
        uid,
        data,
      }
      return row
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(kind).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllMandatsOfAm030(args: CliArgs) {
  const table = 'mandats'
  await truncateTable(table)
  const subDir = path.join(getAm030Path(args), 'acteurs')
  const filenames = readFilesInSubdir(subDir)
  console.log(`Extracting the mandats and inserting them into table ${table}`)

  for (const chunkOfFiles of lo.chunk(filenames, 50)) {
    const rows = chunkOfFiles.flatMap(filename => {
      const { mandats } = readFileAsJson(path.join(subDir, filename))
      const rowsFromThisFile = (mandats as any[]).map((mandat: any) => {
        const uid = mandat.uid as string
        const acteur_uid = mandat.acteurRef as string
        const organes_uids = mandat.organesRefs as string[]
        return { uid, acteur_uid, organes_uids, data: mandat }
      })
      return rowsFromThisFile
    })
    console.log(`Inserting a chunk of ${rows.length} rows`)
    await getDb().insertInto(table).values(rows).execute()
  }
  console.log('Done')
}

async function insertAllFromAgendas(args: CliArgs) {
  const table = 'reunions'
  await truncateTable(table)

  // There are some duplicates of reunions accross legislatures (14 and 15)
  // The versions from 15 are strictly better, they contain the xsiType and the version from 14 does not
  // So we process the latest datasets first
  const datasetsAndLegislature = [
    [AGENDA_16, 16],
    [AGENDA_15, 15],
    [AGENDA_14, 14],
  ] as const
  // And we make a note of the reunions already inserted
  const uidsInsertedSoFar: string[] = []

  for (const [dataset, legislature] of datasetsAndLegislature) {
    const datasetPath = path.join(args.workdir, 'tricoteuses', dataset)
    const files = listFilesRecursively(datasetPath)
    console.log(`Inserting these into table ${table}`)
    for (const chunkOfFiles of lo.chunk(files, 5000)) {
      const rows = chunkOfFiles
        .map(f => {
          const path_in_dataset = f
            .substring(datasetPath.length + 1)
            .replace(/\/[^/]*\.json$/, '')
          const json = readFileAsJson(f)
          const uid = json.uid as string
          if (uidsInsertedSoFar.includes(uid)) {
            // Do not insert it, we have already a better version
            return null
          }
          const row = {
            uid,
            path_in_dataset,
            legislature,
            data: json,
          }
          return row
        })
        .filter(isNotNull)
      console.log(`Inserting a chunk of ${rows.length}`)
      await getDb().insertInto(table).values(rows).execute()
      uidsInsertedSoFar.push(...rows.map(_ => _.uid))
    }
    console.log('Done')
  }
}

async function insertSessionsUsingReunions() {
  // Je n'ai pas trouvé les sessions parlementaires nulle part
  // cf ces discussions sur le sujet
  // https://forum.en-root.org/t/signification-du-champ-sessionref-dun-agenda/189
  // https://forum.en-root.org/t/les-sessions-parlementaires-dans-wikidata/200
  // Je les reconstruit en me basant sur les séance, les résultats ont l'air corrects
  // Note : j'aurai aussi pu me baser sur toutes les réunions, je ne sais pas si ce serait plus correct

  const table = 'sessions'
  await truncateTable(table)
  // note : SCR5A2017I3 est une session étrange, qui ne comporte qu'une seule séance, et le I ne veut rien dire ?
  // à première vue j'ai l'impression que c'est une erreur
  // Donc je hardcode pour fusionner cette session avec la session qui commence le jour immédiatement après
  const weirdSessionRef = 'SCR5A2017I3'
  const weirdSessionRefReplacement = 'SCR5A2018O1'

  console.log(`Querying the reunions to build the ${table}`)

  const { rows } = await sql<{
    session_ref: string
    min_date: string
    max_date: string
  }>`
SELECT 
(CASE
  WHEN data->>'sessionRef' = ${weirdSessionRef}
  THEN ${weirdSessionRefReplacement}
  ELSE data->>'sessionRef'
END) AS session_ref,
MIN(data->>'timestampDebut') AS min_date,
MAX(data->>'timestampDebut') AS max_date
FROM reunions
WHERE
  data->'cycleDeVie'->>'etat' != ALL( '{Annulé, Supprimé}')
  AND data->>'xsiType' = 'seance_type'
GROUP BY session_ref
ORDER BY min_date, max_date, session_ref
  `.execute(getDb())
  const sessions = rows.map(_ => ({
    uid: _.session_ref,
    ordinaire: guessSessionType(_.session_ref) === 'ordinaire',
    min_date: new Date(_.min_date),
    max_date: new Date(_.max_date),
  }))
  console.log(`Inserting a chunk of ${sessions.length}`)
  await getDb().insertInto(table).values(sessions).execute()
  console.log('Done')
}

function guessSessionType(sessionRef: string): 'ordinaire' | 'extraordinaire' {
  // example : SCR5A2018E1 ou SCR5A2021E1
  if (sessionRef.match(/\d{4}O\d+$/)) {
    return 'ordinaire'
  }
  if (sessionRef.match(/\d{4}E\d+$/)) {
    return 'extraordinaire'
  }
  throw new Error(`Unrecognized type of sessionRef : ${sessionRef}`)
}
