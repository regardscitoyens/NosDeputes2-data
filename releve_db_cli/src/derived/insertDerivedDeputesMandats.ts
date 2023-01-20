import { sql } from 'kysely'
import { getDb } from '../utils/db'
import { truncateTable } from '../utils/utils'
import * as lo from 'lodash'

export async function insertDerivedDeputesMandats() {
  const table = 'derived_deputes_mandats'
  await truncateTable(table)

  const mandatsRaw = (
    await sql<{
      legislature: number
      mandat_uid: string
      acteur_uid: string
      slug: string | null
      full_name: string
      region_type: string
      region: string
      num_dpt: string
      name_dpt: string
      num_circo: string
      ref_circo: string
      cause_mandat: CauseMandatRaw
      date_debut_mandat: string
      date_fin_mandat: string | null
      date_fin_legislature: string | null
      suppleant_ref: string | null
    }>`
    SELECT 
      (organes.data->>'legislature')::int AS legislature,
      mandats.uid AS mandat_uid,
      acteurs.uid AS acteur_uid,
      nosdeputes_deputes.slug,
      CONCAT(acteurs.data->'etatCivil'->'ident'->>'prenom', ' ', acteurs.data->'etatCivil'->'ident'->>'nom') AS full_name,
        mandats.data->'election'->'lieu'->>'regionType' as region_type,
        mandats.data->'election'->'lieu'->>'region' as region,
        mandats.data->'election'->'lieu'->>'numDepartement' as num_dpt,
      mandats.data->'election'->'lieu'->>'departement' AS name_dpt,
        mandats.data->'election'->'lieu'->>'numCirco' as num_circo,
        mandats.data->'election'->>'refCirconscription' as ref_circo,
        mandats.data->'election'->>'causeMandat' as cause_mandat,
        mandats.data->>'dateFin' as date_fin_mandat,
        mandats.data->'mandature'->>'datePriseFonction' as date_debut_mandat,
        organes.data->'viMoDe'->>'dateFin' as date_fin_legislature,
        mandats.data->'suppleant'->>'suppleantRef' as suppleant_ref
      FROM acteurs
      INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
      INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
      LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
    WHERE organes.data->>'codeType' = 'ASSEMBLEE'
    `.execute(getDb())
  ).rows

  const finalRows = Object.values(
    lo.groupBy(mandatsRaw, _ => _.legislature + '-' + _.ref_circo),
  ).map(mandatsForCircoRaw => {
    const mandatsForCircoSorted = lo.sortBy(
      mandatsForCircoRaw,
      _ => _.date_debut_mandat,
    )
    const {
      legislature,
      name_dpt,
      num_dpt,
      num_circo,
      region,
      region_type,
      ref_circo,
    } = mandatsForCircoSorted[0]
    const circo = {
      name_dpt,
      num_dpt,
      num_circo,
      region,
      region_type,
      ref_circo,
    }

    const mandatsWithCorrectCauses = mandatsForCircoSorted.map((row, idx) => {
      const {
        acteur_uid,
        cause_mandat,
        date_debut_mandat,
        date_fin_mandat,
        full_name,
        suppleant_ref,
        mandat_uid,
      } = row
      const nextRow = mandatsForCircoSorted[idx + 1] ?? null
      const cause_fin = nextRow ? mapCauseMandat(nextRow.cause_mandat) : null
      return {
        acteur_uid,
        cause_debut: mapCauseMandat(cause_mandat),
        ...(cause_fin ? { cause_fin } : null),
        date_debut_mandat,
        date_fin_mandat,
        full_name,
        suppleant_ref,
        mandat_uid,
      }
    })

    const nb_mandats = mandatsWithCorrectCauses.length
    const mandatsPartitionByElectionsPartielles =
      partitionByElectionsPartielles(mandatsWithCorrectCauses)

    const data: DerivedDeputesMandats = {
      legislature,
      circo,
      mandats: mandatsPartitionByElectionsPartielles,
      nb_mandats,
    }
    return {
      legislature,
      circo_uid: circo.ref_circo,
      nb_mandats,
      data,
    }
  })

  console.log(`Found ${finalRows.length} rows to insert into ${table}`)
  for (const chunkOfRows of lo.chunk(finalRows, 1000)) {
    console.log(`Inserting a chunk of ${chunkOfRows.length}`)
    await getDb().insertInto(table).values(chunkOfRows).execute()
  }
  console.log('Done')
}

type DerivedDeputesMandats = {
  legislature: number
  circo: {
    region_type: string
    region: string
    num_dpt: string
    name_dpt: string
    num_circo: string
    ref_circo: string
  }
  mandats: {
    acteur_uid: string
    cause_debut: CauseChangement
    cause_fin?: CauseChangement
    date_debut_mandat: string
    date_fin_mandat: string | null
    full_name: string
    suppleant_ref: string | null
    mandat_uid: string
  }[][]
  nb_mandats: number
}

type CauseChangement =
  | {
      kind: 'elections_generales'
    }
  | {
      kind: 'remplacement'
      details:
        | 'demission_incompatibilite_mandats'
        | 'decede'
        | 'mission_longue'
        | 'nomme_cc'
        | 'nomme_gvt'
    }
  | {
      kind: 'retour'
      details: 'retour_gvt'
    }
  | {
      kind: 'elections_partielles'
      details?:
        | 'decede_sans_suppleant'
        | 'dechu'
        | 'demission'
        | 'demission_incompatibilite'
        | 'elu_parlement_europeen'
        | 'elu_senat'
        | 'annulation_election'
    }

const cause_mandat_raw = [
  "remplacement d'un député ayant démissionné pour cause d’incompatibilité prévue aux articles LO 137, LO 137-1, LO 141 ou LO 141-1 du code électoral",
  "remplacement d'un député décédé",
  "remplacement d'un député en mission au-delà de 6 mois",
  "remplacement d'un député nommé au Conseil Constitutionnel",
  "remplacement d'un député nommé au Gouvernement",
  "reprise de l'exercice du mandat d'un ancien membre du Gouvernement",
  'élection partielle',
  "élection partielle, en remplacement d'un député décédé et sans suppléant",
  "élection partielle, remplacement d'un député déchu de son mandat",
  "élection partielle, remplacement d'un député démissionnaire",
  "élection partielle, remplacement d'un député démissionnaire d'office",
  "élection partielle, remplacement d'un député démissionnaire d'office (pour incompatibilité)",
  "élection partielle, remplacement d'un député élu au Parlement européen",
  "élection partielle, remplacement d'un député élu au Sénat",
  "élection partielle, suite à l'annulation de l'élection d'un député",
  'élections générales',
] as const
type CauseMandatRaw = typeof cause_mandat_raw[number]

function mapCauseMandat(cause_mandat: CauseMandatRaw): CauseChangement {
  switch (cause_mandat) {
    case `élections générales`:
      return { kind: 'elections_generales' }
    case "remplacement d'un député ayant démissionné pour cause d’incompatibilité prévue aux articles LO 137, LO 137-1, LO 141 ou LO 141-1 du code électoral":
      return {
        kind: 'remplacement',
        details: 'demission_incompatibilite_mandats',
      }
    case `remplacement d'un député décédé`:
      return {
        kind: 'remplacement',
        details: 'decede',
      }
    case `remplacement d'un député en mission au-delà de 6 mois`:
      return {
        kind: 'remplacement',
        details: 'mission_longue',
      }
    case `remplacement d'un député nommé au Conseil Constitutionnel`:
      return {
        kind: 'remplacement',
        details: 'nomme_cc',
      }
    case `remplacement d'un député nommé au Gouvernement`:
      return {
        kind: 'remplacement',
        details: 'nomme_gvt',
      }
    case `reprise de l'exercice du mandat d'un ancien membre du Gouvernement`:
      return {
        kind: 'retour',
        details: 'retour_gvt',
      }
    case `élection partielle`:
      return {
        kind: 'elections_partielles',
      }
    case `élection partielle, en remplacement d'un député décédé et sans suppléant`:
      return { kind: 'elections_partielles', details: 'decede_sans_suppleant' }
    case `élection partielle, remplacement d'un député déchu de son mandat`:
      return { kind: 'elections_partielles', details: 'dechu' }
    case `élection partielle, remplacement d'un député démissionnaire`:
    case `élection partielle, remplacement d'un député démissionnaire d'office`:
      return { kind: 'elections_partielles', details: 'demission' }
    case `élection partielle, remplacement d'un député démissionnaire d'office (pour incompatibilité)`:
      return {
        kind: 'elections_partielles',
        details: 'demission_incompatibilite',
      }
    case `élection partielle, remplacement d'un député élu au Parlement européen`:
      return {
        kind: 'elections_partielles',
        details: 'elu_parlement_europeen',
      }
    case `élection partielle, remplacement d'un député élu au Sénat`:
      return {
        kind: 'elections_partielles',
        details: 'elu_senat',
      }
    case `élection partielle, suite à l'annulation de l'élection d'un député`:
      return {
        kind: 'elections_partielles',
        details: 'annulation_election',
      }
    default:
      throw new Error(`Unknown cause mandat ${cause_mandat}`)
  }
}

function partitionByElectionsPartielles<
  A extends {
    cause_debut: {
      kind:
        | 'elections_generales'
        | 'remplacement'
        | 'retour'
        | 'elections_partielles'
    }
  },
>(rows: A[]): A[][] {
  const res: A[][] = []
  rows.forEach(row => {
    if (res.length === 0 || row.cause_debut.kind === 'elections_partielles') {
      // start a new subarray
      res.push([])
    }
    // add to the current subarray
    res[res.length - 1].push(row)
  })
  return res
}
