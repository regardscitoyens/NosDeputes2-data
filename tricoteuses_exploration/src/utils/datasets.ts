// Liste de tous les repos dans assemblee_nettoyee

export const AM030 = 'AMO30_tous_acteurs_tous_mandats_tous_organes_historique'
export const AM030_16 =
  'AMO40_deputes_actifs_mandats_actifs_organes_divises_XVI'
export const AM030_15 = 'AMO40_deputes_actifs_mandats_actifs_organes_divises_XV'

export const datasetsForRegardsCitoyens = [
  // contient tous les acteurs + organes avec historique
  AM030,

  // Pour les acteurs, ce dépôt est un sous-ensemble strict de AMO30, aucun intéret
  //
  // Pour les organes :
  // Quand l'organe est aussi présent dans AMO30, il vaut mieux prendre celui
  // d'AMO30, car il contient le xsiType (c'est la seule différence semble-t-i).
  // Sinon, il faut le prendre seulement si on est intéressé par les législatures
  // précédentes.
  // NOTE : à vérifier
  AM030_16,
  // idem
  AM030_15,
]

// Autres repos qu'il faudra ensuite surement intégrer :
// Agenda_XIV_nettoye​
// Agenda_XVI_nettoye​
// Agenda_XV_nettoye​
// Amendements_XVI_nettoye​
// Amendements_XV_nettoye​
// documents_html_nettoye​
// Dossiers_Legislatifs_XIV_nettoye​
// Dossiers_Legislatifs_XVI_nettoye​
// Dossiers_Legislatifs_XV_nettoye​
// Scrutins_XIV_nettoye​
// Scrutins_XVI_nettoye
// Scrutins_XV_nettoye
