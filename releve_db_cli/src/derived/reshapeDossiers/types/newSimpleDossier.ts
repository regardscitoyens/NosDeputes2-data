export type NewSimpleDossier = {
  uid: string
  generalInfos: {
    title: string
    urlAn: string
    urlSenat?: string
  } & {
    kind:
      | 'pjl_finances_secu'
      | 'pjl_finances_annee'
      | 'pjl_finances_rectificative'
      | 'pj_ratification'
      | 'pjl_ou_ppl_organique'
      | 'pjl_ou_ppl_constitutionnelle'
      | 'pjl_ordinaire'
      | 'ppl_ordinaire'
      | 'ppl_article11'
      | 'motion_referendaire'
      | 'allocution_president_an'
      | 'resolution' // pas sur de la difference entre les deux resolutions
      | 'resolution_article34-1'
      | 'commission_enquete'
      | 'engagement_responsabilite_gouvernement' // pourquoi ce serait un dossier à part ? ça fait partie du cycle de vie d'un PJL normalement ?
      | 'responsabilite_penale_president_republique'
      | 'mission_information'
      | 'rapport_information_sans_mission'
      | 'immunite'
      | 'message_president_republique'
  }
  lifeCycle?: {
    initiateurs: { acteurRef: string; mandatRef: string }[]
    procedureAcceleree?: {
      date: string
    }
    retrait?: {
      date: string
    }
    lectures: (
      | {
          kind: 'chambre'
          chambre: { kind: 'an' | 'senat'; legislature: number }
          depot: {
            date: string
            texteRef: string
          }
          travauxCommissions: {
            commissionFond: TravauxCommission
            commissionsPourAvis: TravauxCommission[]
          }
          hemicycle: {
            seances: {
              date: string
              seanceRef: string
            }[]
            // pas clair pourquoi mais apparemment c'est possible d'avoir plusieurs engagements du 49_3 au cours de la même lecture ?
            // cf http://localhost:3000/dossier/DLR5L16N45988 lors de la première lecture. A creuser
            engagement49_3: {
              date: string
              texteRef: string
            }[]
            motionsCensure: {}[]
            decision: 'adopte' | 'rejete' | 'adopte_via_49_3'
          }
        }
      | {
          kind: 'cmp'
          dateConvocation: string
          rapporteurs: {
            dateNomination: string
            rapporteurs: { acteurRef: string; mandatRef: string }[]
          }
          rapportAn: {
            kind: 'an'
            url: string
            dateDepot: string
          }
          rapportSenat: {
            kind: 'senat'
            url: string
            dateDepot: string
          }
          decision: {
            kind: 'accord' | 'desaccord' // a creuser les possibilités
            date: string
          }
        }
    )[]
    conseilConstitutionnel?: {
      dateSaisie: string
      initiateur: {} // à creuser. Par exemple pour http://localhost:3000/dossier/DLR5L16N45988 il a été saisie deux fois à la même date, pbablement à l'initiative de différentes personnes ?
      conclusion: {
        date: string
        kind: 'conforme' | 'non_conforme' // il y a d'autres possibilités
      }
    }
    promulgation?: {
      date: string
      texteLoiRef: string
      // il y a d'autres trucs
    }
  }
}

type CommissionKind = 'finances' | 'lois' //etc.

type TravauxCommission = {
  commissionKind: CommissionKind
  dateSaisie: string
  rapporteurs: {
    // à creuser ce que ça veut dire. Probablement pas si utile que ça
    // attention en fait pour un gros dossier dans la même commission on peut avoir plusieurs types de rapporteurs, nommés à des dates différentes
    rapporteursKind: 'normal' | 'special' | 'general' | 'pour_avis'
    dateNomination: string
    rapporteurs: { acteurRef: string; mandatRef: string }[]
  }
  reunions: {
    date: string
    reunionRef: string
  }[]
  rapport: {
    rapportRef: string
    date: string
  }
}

// motions de censure ??
// 49.3 du grouvernement ??
// => à glisser dans les étapes de la lecture
