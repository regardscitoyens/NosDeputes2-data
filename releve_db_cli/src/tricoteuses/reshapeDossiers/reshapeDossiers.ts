import { getDb } from '../../utils/db'
import { truncateTable } from '../../utils/utils'
import * as dossierTypes from './types/dossier'
import { NewSimpleDossier } from './types/newSimpleDossier'
import * as lo from 'lodash'

const acc: string[] = []
let count = 0
const keysFrequencies: { [k: string]: number } = {}

function sortAndUniq(arr: string[]) {
  return lo.sortBy(lo.uniq(arr), _ => _)
}

function str(a: any) {
  return JSON.stringify(a)
}

function keys(a: any) {
  return Object.keys(a)
}

function json(a: any): string {
  return JSON.stringify(a)
}
function registerKeysOf(a: any) {
  Object.keys(a).forEach(k => {
    keysFrequencies[k] = keysFrequencies[k] | 0
    keysFrequencies[k]++
  })
}

function registerValue(a: string) {
  acc.push(a)
}

function chooseDossierKind(
  raw: dossierTypes.RawDossierFromDb,
): NewSimpleDossier['generalInfos']['kind'] {
  const {
    procedureParlementaire: { libelle },
  } = raw

  const mappingLibelle: Record<
    typeof libelle,
    NewSimpleDossier['generalInfos']['kind']
  > = {
    Immunité: 'immunite',
    "Allocution du Président de l'Assemblée nationale":
      'allocution_president_an',
    "Commission d'enquête": 'commission_enquete',
    'Engagement de la responsabilité gouvernementale':
      'engagement_responsabilite_gouvernement',
    'Message du président de la république': 'message_president_republique',
    "Mission d'information": 'mission_information',
    'Motion référendaire': 'motion_referendaire',
    'Projet de loi de financement de la sécurité sociale': 'pjl_finances_secu',
    "Projet de loi de finances de l'année": 'pjl_finances_annee',
    'Projet de loi de finances rectificative': 'pjl_finances_rectificative',
    'Projet de loi ordinaire': 'pjl_ordinaire',
    'Projet de ratification des traités et conventions': 'pj_ratification',
    'Projet ou proposition de loi constitutionnelle':
      'pjl_ou_ppl_constitutionnelle',
    'Projet ou proposition de loi organique': 'pjl_ou_ppl_organique',
    'Proposition de loi ordinaire': 'pjl_ordinaire',
    "Proposition de loi présentée en application de l'article 11 de la Constitution":
      'ppl_article11',
    "Rapport d'information sans mission": 'rapport_information_sans_mission',
    'Responsabilité pénale du président de la république':
      'responsabilite_penale_president_republique',
    Résolution: 'resolution',
    'Résolution Article 34-1': 'resolution_article34-1',
  }
  return mappingLibelle[libelle]
}

function reshapeDossier(raw: dossierTypes.RawDossierFromDb): NewSimpleDossier {
  const { uid } = raw
  const generalInfos: NewSimpleDossier['generalInfos'] = {
    title: raw.titreDossier.titre,
    kind: chooseDossierKind(raw),
    urlAn: `http://www.assemblee-nationale.fr/dyn/${raw.legislature}/dossiers/${raw.titreDossier.titreChemin}`,
    urlSenat: raw.titreDossier.senatChemin,
  }
  return { uid, generalInfos }
}

export async function reshapeDossiers() {
  const rawDossiersFromDb = (
    await getDb().selectFrom('dossiers').select('data').execute()
  ).map(_ => _.data as dossierTypes.RawDossierFromDb)

  const table = 'dossiers_simplified'
  await truncateTable(table)

  console.log(`Found ${rawDossiersFromDb.length} dossiers to be reshaped`)
  for (const chunkOfDossiers of lo.chunk(rawDossiersFromDb, 1000)) {
    const rows = chunkOfDossiers.map(reshapeDossier).map(_ => ({
      uid: _.uid,
      data: _,
    }))
    console.log(`Inserting a chunk of ${rows.length}`)
    await getDb().insertInto(table).values(rows).execute()
  }
  console.log('Done')
}

function runAnalysis(rawDossiersFromDb: dossierTypes.RawDossierFromDb[]) {
  rawDossiersFromDb.forEach(rawDossier => {
    count++
    registerKeysOf(rawDossier.procedureParlementaire)
  })

  console.log(`Nombre d'éléments`, count)

  console.log('Fréquence de chaque clé')
  console.log(
    Object.fromEntries(lo.sortBy(Object.entries(keysFrequencies), _ => -_[1])),
  )

  console.log('Valeurs uniques', sortAndUniq(acc))
}
