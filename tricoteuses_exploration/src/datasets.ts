// Liste de tous les repos dans assemblee_nettoyee

const datasetsForRegardsCitoyens = [
  // contient tous les acteurs + organes avec historique
  "AMO30_tous_acteurs_tous_mandats_tous_organes_historique_nettoye",

  // Pour les acteurs, ce dépôt est un sous-ensemble strict de AMO30 :
  // Il a moins d'acteurs et il sont moins complets.
  //
  // Pour les organes :
  // Quand l'organe est aussi présent dans AMO30, il vaut mieux prendre celui
  // d'AMO30, car il contient le xsiType (c'est la seule différence semble-t-i).
  // Sinon, il faut le prendre seulement si on est intéressé par les législatures
  // précédentes.
  // NOTE : à vérifier
  "AMO40_deputes_actifs_mandats_actifs_organes_divises_XVI_nettoye",
  // idem
  "AMO40_deputes_actifs_mandats_actifs_organes_divises_XV_nettoye",
];

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
