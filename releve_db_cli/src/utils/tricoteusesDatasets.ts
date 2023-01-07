// Liste de tous les repos dans assemblee_nettoyee

export const AM030 = 'AMO30_tous_acteurs_tous_mandats_tous_organes_historique'
export const AM030_16 =
  'AMO40_deputes_actifs_mandats_actifs_organes_divises_XVI'
export const AM030_15 = 'AMO40_deputes_actifs_mandats_actifs_organes_divises_XV'

export const AGENDA_14 = 'Agenda_XIV'
export const AGENDA_15 = 'Agenda_XV'
export const AGENDA_16 = 'Agenda_XVI'

export const DOSSIERS_14 = 'Dossiers_Legislatifs_XIV'
export const DOSSIERS_15 = 'Dossiers_Legislatifs_XV'
export const DOSSIERS_16 = 'Dossiers_Legislatifs_XVI'

export const SCRUTINS_14 = 'Scrutins_XIV'
export const SCRUTINS_15 = 'Scrutins_XV'
export const SCRUTINS_16 = 'Scrutins_XVI'

export const datasetsToClone = [
  // contient tous les acteurs + organes avec historique
  AM030,

  // Pour les acteurs, ce dépôt est un sous-ensemble strict de AMO30, aucun intéret
  //
  // Pour les organes :
  // Quand l'organe est aussi présent dans AMO30, il vaut mieux prendre celui
  // d'AMO30, car il contient le xsiType (c'est la seule différence semble-t-i).
  // Sinon, il faut le prendre seulement si on est intéressé par les législatures
  // précédentes.
  // TODO : à voir, est-ce qu'il faut intégrer ces organes du coup ou pas ?
  AM030_16,
  // idem
  AM030_15,

  // toutes les réunions et séances (mais pas ce qui s'est dit, ni les participants ?)
  AGENDA_14,
  AGENDA_15,
  AGENDA_16,

  DOSSIERS_14,
  DOSSIERS_16,
  DOSSIERS_15,

  SCRUTINS_14,
  SCRUTINS_15,
  SCRUTINS_16,
]

// Autres repos qu'il faudra ensuite surement intégrer :
// Amendements_XVI_nettoye
// Amendements_XV_nettoye
// documents_html_nettoye
