import lo from 'lodash'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { getDb } from '../utils/db'
import {
  readFileAsJson,
  readFilesInSubdir,
  truncateTable,
  withChunkFactor,
} from '../utils/utils'

type NosDeputesJsonFile = {
  id_nd: number
  id_an: string
  slug: string
  legislature: number
}[]

export async function autoarchiveInsert(args: CliArgs) {
  await autoarchiveInsertSlugs(args)
  await autoarchiveInsertStats(args)
}

async function autoarchiveInsertSlugs(args: CliArgs) {
  const deputes = readDeputesFile(args)
  const table = 'nosdeputes_deputes'
  await truncateTable(table)
  console.log(`Inserting ${deputes.length} rows into ${table}`)
  for (const versionsOfSameDepute of Object.values(
    lo.groupBy(deputes, d => d.id_an),
  )) {
    // In NosDeputes, the same depute can exist in different legislatures
    // and have different slugs
    // Exemple : yannick-favennec => became yannick-favennec-becot
    // Exemple : christine-cloarec => became christine-le-nabour
    // For these cases we will always prefer the most recent slug
    const latestVersion = lo.sortBy(
      versionsOfSameDepute,
      d => -d.legislature,
    )[0]
    const { slug, id_an } = latestVersion
    await getDb()
      .insertInto(table)
      .values({
        uid: id_an,
        slug,
      })
      .execute()
  }
  console.log('Done')
}

function readDeputesFile({ workdir }: CliArgs) {
  const filepath = path.join(
    workdir,
    'autoarchive',
    'data',
    'nosdeputes',
    'basicdata',
    'nosdeputes_basic_data.json',
  )
  console.log(`Reading file ${filepath}`)
  const deputes = readFileAsJson(filepath) as NosDeputesJsonFile
  return deputes
}

async function autoarchiveInsertStats(args: CliArgs) {
  const table = 'nosdeputes_deputes_weekly_stats'
  await truncateTable(table)
  const statsDir = path.join(
    args.workdir,
    'autoarchive',
    'data',
    'nosdeputes',
    'weeklystats',
    'stats',
  )
  const filenames = readFilesInSubdir(statsDir)
  for (const chunkOfFiles of lo.chunk(filenames, withChunkFactor(100))) {
    const rows = chunkOfFiles.map(filename => {
      const filepath = path.join(statsDir, filename)
      const statsFromFile = readFileAsJson(filepath) as DeputeStatsFile
      const { id_an, legislature } = statsFromFile
      const statsReorganized = readAndReorganizeStats(statsFromFile)
      return {
        uid: id_an,
        legislature,
        data: statsReorganized,
      }
    })
    console.log(`Inserting a chunk of ${rows.length}`)
    await getDb().insertInto(table).values(rows).execute()
  }
  console.log('Done')
}

function readAndReorganizeStats(rawStatsFromFile: DeputeStatsFile) {
  const {
    labels,
    vacances,
    date_debut,
    n_presences: {
      commission: nb_presences_commission,
      hemicycle: nb_presences_hemicycle,
    },
    n_participations: {
      commission: nb_participations_commission,
      hemicycle: nb_participations_hemicycle,
    },
    presences_medi: {
      commission: mediane_presences_commission,
      hemicycle: mediane_presences_hemicycle,
      total: mediane_presences_total,
    },
  } = rawStatsFromFile

  // Des fois dans les vacances il y a une semaine "0" au début en plus, elle ne semble pas pertinente
  const vacances_cleaned = removeKey(vacances, '0')

  // maintenant on devrait avoir le même nombre de semaine, quelle que soit la stat
  const nbWeeks = nbkeys(labels)

  const firstWeekMonday = toMonday(date_debut)

  // on réorganise
  const statsForDeputeAndLegislatureByWeek = Object.fromEntries(
    Array.from({ length: nbWeeks }).map((_, weekIndex) => {
      const w2 = weekIndex + 1 // the NosDeputes weeks number start at 1 instead of 0
      const stats = {
        isVacances: vacances_cleaned[w2] !== 0,
        nb_presences_commission: asNumber(nb_presences_commission[w2]),
        nb_presences_hemicycle: asNumber(nb_presences_hemicycle[w2]),
        nb_participations_commission: asNumber(
          nb_participations_commission[w2],
        ),
        nb_participations_hemicycle: asNumber(nb_participations_hemicycle[w2]),
        mediane_presences_commission: asNumber(
          mediane_presences_commission[w2],
        ),
        mediane_presences_hemicycle: asNumber(mediane_presences_hemicycle[w2]),
        mediane_presences_total: asNumber(mediane_presences_total[w2]),
      }
      const weekMonday = addWeeks(firstWeekMonday, weekIndex)
      return [weekMonday, stats]
    }),
  )
  return statsForDeputeAndLegislatureByWeek
}

function nbkeys(obj: any) {
  return Object.keys(obj).length
}

function asNumber(n: number | string | null): number {
  if (typeof n === 'string') {
    return parseInt(n, 10)
  }
  if (n === null) return 0
  return n
}

function toMonday(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function addWeeks(dateStr: string, nbWeeks: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + nbWeeks * 7)
  return d.toISOString().split('T')[0]
}

type DeputeStatsFile = {
  id_an: string
  legislature: number
  nom: string
  labels: { [k: string]: string }
  vacances: { [k: string]: 0 | 20 }
  date_debut: string
  date_debut_parl: string
  date_fin: string
  n_presences: {
    commission: { [k: string]: number | string | null }
    hemicycle: { [k: string]: number | string | null }
  }
  n_participations: {
    commission: { [k: string]: number | string | null }
    hemicycle: { [k: string]: number | string | null }
  }
  n_questions?: { [k: string]: number | string | null } // seems present only from legislature 16
  presences_medi: {
    commission: { [k: string]: number | string | null }
    hemicycle: { [k: string]: number | string | null }
    total: { [k: string]: number | string | null }
  }
}

function removeKey<A>(
  obj: { [k: string]: A },
  key: string,
): { [k: string]: A } {
  const { ...copy } = obj
  delete copy[key]
  return copy
}
