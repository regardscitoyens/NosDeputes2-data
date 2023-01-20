import { sql } from 'kysely'
import { CliArgs } from './utils/cli'
import { getDb } from './utils/db'

export async function sandbox(args: CliArgs) {
  const rows = (
    await sql<any>`
SELECT 
  (organes.data->>'legislature')::int AS legislature,
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
	mandats.data->>'dateDebut' as date_debut_mandat,
	organes.data->'viMoDe'->>'dateFin' as date_fin_legislature,
	mandats.data->'suppleant'->>'suppleantRef' as suppleant_ref
  FROM acteurs
  INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
  INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
  LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
WHERE organes.data->>'codeType' = 'ASSEMBLEE'
`.execute(getDb())
  ).rows

  await getDb().insertInto('derived_deputes_mandats').values(rows).execute()
}
