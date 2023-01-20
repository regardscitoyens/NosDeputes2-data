// Very complicated object
// Types written manually. Some fields I left unknown
// See also : https://data.tricoteuses.fr/doc/assemblee/actes/schemas.html#actelegislatif.json
// https://www.assemblee-nationale.fr/opendata/Schemas_Entites/Loi/Schema_DossierLegislatif.html#dossier-legislatif

import * as acteTypes from './acte'

export type RawDossierFromDb = {
  actesLegislatifs?: acteTypes.ActeLegislatif[]
  fusionDossier?: {
    cause: 'Dossier absorbé' | 'Examen commun'
    dossierAbsorbantRef: string
  }
  indexation: unknown // https://data.tricoteuses.fr/doc/assemblee/document.html#indexation.json
  initiateur?: {
    acteurs?: { acteurRef: string; mandatRef: string }[]
    organeRef?: string
  }
  legislature: string // c'est un nombre stringifié
  plf?: Plf

  titreDossier: {
    titre: string
    senatChemin?: string
    titreChemin: string
  }
  uid: string
} & (
  | {
      xsiType: 'DossierLegislatif_Type'
      procedureParlementaire: {
        libelle:
          | 'Motion référendaire'
          | 'Projet de loi de financement de la sécurité sociale'
          | "Projet de loi de finances de l'année"
          | 'Projet de loi de finances rectificative'
          | 'Projet de loi ordinaire'
          | 'Projet de ratification des traités et conventions'
          | 'Projet ou proposition de loi constitutionnelle'
          | 'Projet ou proposition de loi organique'
          | 'Proposition de loi ordinaire'
          | "Proposition de loi présentée en application de l'article 11 de la Constitution"
      }
    }
  | {
      xsiType: 'DossierResolutionAN'
      procedureParlementaire: {
        libelle:
          | "Allocution du Président de l'Assemblée nationale"
          | 'Résolution'
          | 'Résolution Article 34-1'
      }
    }
  | {
      xsiType: 'DossierCommissionEnquete_Type'
      procedureParlementaire: {
        libelle: "Commission d'enquête"
      }
    }
  | {
      xsiType: 'DossierIniativeExecutif_Type'
      procedureParlementaire: {
        libelle:
          | 'Engagement de la responsabilité gouvernementale'
          | 'Message du président de la république'
      }
    }
  | {
      xsiType: 'DossierMissionControle_Type'
      procedureParlementaire: {
        libelle:
          | "Rapport d'information sans mission"
          | 'Responsabilité pénale du président de la république'
      }
    }
  | {
      xsiType: 'DossierMissionInformation_Type'
      procedureParlementaire: {
        libelle: "Mission d'information"
      }
    }
  | {
      //xsiType manquant dans ce cas !
      procedureParlementaire: {
        libelle: 'Immunité'
      }
    }
)

type Plf = {
  uid: string
  ordreDiqs: string // c'est un nombre stringifié
  organeRef: string
  rapporteurs?: {
    acteurRef: string
    typeRapporteur: 'rapporteur pour avis' | 'rapporteur spécial'
  }[]
  texteAssocie?: string
  missionMinefi?: {
    missions?: [
      {
        typeBudget:
          | 'Budget général'
          | 'Compte de concours financier'
          | 'Compte spécial'
          | 'Première partie'
        libelleLong: string
        typeMission: 'partie de mission' | 'mission secondaire'
        libelleCourt: string
      },
    ]
    typeBudget:
      | 'Budget général'
      | 'Compte de concours financier'
      | 'Compte spécial'
      | 'Première partie'
    libelleLong: string
    typeMission: 'mission principale'
    libelleCourt: string
  }
  ordreCommission: '1'
}[]
