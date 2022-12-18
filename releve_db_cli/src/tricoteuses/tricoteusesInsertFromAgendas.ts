import { sql } from 'kysely'
import lo from 'lodash'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { AGENDA_14, AGENDA_15, AGENDA_16 } from '../utils/datasets'
import {
  areRangesOverlapping,
  DateRange,
  getDateRangeInsideRatio,
} from '../utils/dateRanges'
import { getDb } from '../utils/db'
import {
  getPossiblePairs,
  isNotNull,
  listFilesRecursively,
  readFileAsJson,
  truncateTable,
} from '../utils/utils'

export async function insertReunionsAndSesssionsFromAgendas(args: CliArgs) {
  await insertReunions(args)
  await insertSessionsUsingReunions()
}

async function insertReunions(args: CliArgs) {
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

  // Les sessions extraordinaires devraient pouvoir être trouvées quelque part dans le JO
  // https://www2.assemblee-nationale.fr/decouvrir-l-assemblee/role-et-pouvoirs-de-l-assemblee-nationale/l-organisation-des-travaux-de-l-assemblee-nationale/le-regime-des-sessions-et-des-seances
  // "La session extraordinaire est ouverte et close par décret du Président de la République (article 30)."
  //

  const table = 'sessions'
  await truncateTable(table)
  // note : SCR5A2017I3 est une session étrange, qui ne comporte qu'une seule séance, et le I ne veut rien dire ?
  // à première vue j'ai l'impression que c'est une erreur
  // Donc je hardcode pour fusionner cette session avec la session qui commence le jour immédiatement après
  const weirdSessionRef = 'SCR5A2017I3'
  const weirdSessionRefReplacement = 'SCR5A2018O1'

  console.log(`Querying the reunions to build the ${table}`)

  const sessions = (
    await sql<{
      session_ref: string
      start_date: string
      end_date: string
    }>`
SELECT 
(CASE
  WHEN data->>'sessionRef' = ${weirdSessionRef}
  THEN ${weirdSessionRefReplacement}
  ELSE data->>'sessionRef'
END) AS session_ref,
MIN(data->>'timestampDebut') AS start_date,
MAX(GREATEST(data->>'timestampDebut', data->>'timestampFin')) AS end_date
FROM reunions
WHERE
  data->'cycleDeVie'->>'etat' != ALL( '{Annulé, Supprimé}')
  AND data->>'xsiType' = 'seance_type'
GROUP BY session_ref
ORDER BY start_date, end_date, session_ref
  `.execute(getDb())
  ).rows.map(_ => ({
    uid: _.session_ref,
    ordinaire: guessSessionType(_.session_ref) === 'ordinaire',
    start_date: new Date(_.start_date),
    end_date: new Date(_.end_date),
  }))
  checkSessionAreNotOverlapping(sessions)
  const legislatures = await queryLegislatures()
  const sessionsWithLegislature = sessions.map(session => ({
    ...session,
    legislature: getBestMatchingLegislatureForSession(session, legislatures)
      .legislature,
  }))
  console.log(`Inserting a chunk of ${sessionsWithLegislature.length}`)
  await getDb().insertInto(table).values(sessionsWithLegislature).execute()
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

async function queryLegislatures(): Promise<Legislature[]> {
  return (
    await sql<{
      legislature: number
      start_date: string
      end_date: string | null
    }>`
SELECT 
  (data->>'legislature')::int AS legislature,
  data->'viMoDe'->>'dateDebut' AS start_date,
  data->'viMoDe'->>'dateFin' AS end_date
FROM organes
  WHERE data->>'codeType' = 'ASSEMBLEE'
  `.execute(getDb())
  ).rows.map(_ => ({
    ..._,
    start_date: new Date(_.start_date),
    end_date: _.end_date ? new Date(_.end_date) : null,
  }))
}

type Legislature = {
  legislature: number
  start_date: Date
  end_date: Date | null
}

// The last session of the 15th legislature
// goes a few days after the theoretical end date of the legislature...
// So we have to do an approximation
function getBestMatchingLegislatureForSession(
  session: DateRange,
  legislatures: Legislature[],
): Legislature {
  if (legislatures.length > 0) {
    return lo.maxBy(legislatures, legislature => {
      const legislatureWithForcedEndDate = {
        ...legislature,
        // the current legislature has no end date
        // let's just say it end in 1 year
        // this should make our algorithm roughly work
        end_date: legislature.end_date ?? getNowPlus1Year(),
      }
      return getDateRangeInsideRatio(session, legislatureWithForcedEndDate)
    })!
  }
  throw new Error(
    'No legislatures found, cannot associate legislature to session',
  )
}

function getNowPlus1Year() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}

function checkSessionAreNotOverlapping(
  sessions: ({ uid: string } & DateRange)[],
) {
  getPossiblePairs(sessions).forEach(([a, b]) => {
    if (areRangesOverlapping(a, b)) {
      throw new Error(
        `Sessions ${a.uid} and ${b.uid} are overlapping (${a.start_date} to ${a.end_date} vs ${b.start_date} to ${b.end_date})`,
      )
    }
  })
}
