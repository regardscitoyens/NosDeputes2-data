import path from 'path'
import { CliArgs } from './utils/cli'
import { readCsv } from './utils/readCsv'
import { writeToFile } from './utils/utils'

export async function doSelectiveExport(args: CliArgs, legislature: number) {
  console.log('TBD')

  const giantExportFolder = path.join(
    args.workdir,
    'giant_export',
    `L${legislature}`,
  )

  const parlementairesCsvFile = path.join(
    giantExportFolder,
    'parlementaire',
    'parlementaire.csv',
  )

  const json = await readAndReworkParlementairesIntoMinimalJson(
    parlementairesCsvFile,
  )
  const jsonFile = path.join(
    args.workdir,
    'selective_export',
    'deputes',
    `L${legislature}.json`,
  )
  console.log(`Writing to ${jsonFile}`)
  writeToFile(jsonFile, JSON.stringify(json, null, 2))
}

function processNulls(row: string[]): (string | null)[] {
  return row.map(value => {
    if (value === `\\N`) return null
    return value
  })
}

async function readAndReworkParlementairesIntoMinimalJson(
  parlementairesCsvFile: string,
): Promise<any> {
  const rows = await readCsv(parlementairesCsvFile)

  const json = rows.map(row => {
    const [
      id,
      nb_commentaires,
      nom,
      nom_de_famille,
      sexe,
      date_naissance,
      lieu_naissance,
      nom_circo,
      num_circo,
      sites_web,
      debut_mandat,
      fin_mandat,
      place_hemicycle,
      url_an,
      profession,
      autoflip,
      id_an,
      type,
      groupe_acronyme,
      parti,
      adresses,
      suppleant_de_id,
      anciens_mandats,
      autres_mandats,
      anciens_autres_mandats,
      mails,
      collaborateurs,
      top,
      villes,
      url_ancien_cpc,
      url_nouveau_cpc,
      created_at,
      updated_at,
      slug,
    ] = processNulls(row)

    return {
      idNosDeputes: id,
      slug,
      id_an,
      nom,
      sexe,
      date_naissance,
      nom_circo,
      num_circo,
      debut_mandat,
      fin_mandat,
      place_hemicycle,
      groupe_acronyme,
    }
  })

  return json
}
