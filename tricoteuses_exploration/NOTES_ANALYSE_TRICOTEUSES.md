# Liens principaux

- Les repos https://git.en-root.org/tricoteuses (le code + les données)
- Le forum https://forum.en-root.org/ (contient quelques infos très utiles éparpillées)
- Doc sur les différents schémas https://data.tricoteuses.fr/doc/index.html (indispensable !)
- Le site data https://data.tricoteuses.fr/ plus à jour donc sans intérêt pour nous
- La homepage https://tricoteuses.fr/ il y a des menus pour "voir" les jsons directement mais ça n'est pas très utilisable. Sans intérêt pour nous

# Autres liens

Schemas JSON
https://git.en-root.org/tricoteuses/tricoteuses-assemblee/-/tree/master/src/schemas
Schémas très utiles car il y a plein de commentaires explicatifs sur chaque champ

Doc des schémas de l'assemblée
https://www.assemblee-nationale.fr/opendata/Schemas_Entites/AMO/Schemas_Organes.html#type-organe-parlemtaire
à explorer, mais tout n'est pas documenté apparemment

La pipeline des Tricoteuses est expliquée dans un commentaire en bas de cette discussion
https://forum.en-root.org/t/evolution-de-la-chaine-de-nettoyage-des-donnees-brutes-de-lassemblee/84/9

    tricoteuses-assemblee extrait les données de l’assemblée et les push dans les dépôts de assemblee-brut
    chaque dépôt dans assemblee-brut (par exemple Dossiers_Legislatifs_XV) nettoie les données et les pousse dans les dépôts correspondants dans assemblee-nettoye.
    chaque dépôt dans assemblee-nettoye (par exemple Dossiers_Legislatifs_XV_nettoye) déclenche, par API, des pipeline qui vont, par exemple, mettre à jour la machine https://tricoteuses.fr en mettant à jour les dépôts nettoyés.

## Repos interessants

tricoteuses-assemblee
https://git.en-root.org/tricoteuses/tricoteuses-assemblee
repo le plus intéressant
fetch / parsing / clean des données open data de l'AN
organisés sous forme de divers scripts

assemblee-nettoyee
https://git.en-root.org/tricoteuses/data/assemblee-nettoye
Répertoires avec pleins de datasets "nettoyés", chacun dans un repo. A priori c'est ce qu'on va regarder.

# Datasets nettoyés intéressants

## AMO30_tous_acteurs_tous_mandats_tous_organes_historique_nettoye

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/AMO30_tous_acteurs_tous_mandats_tous_organes_historique_nettoye

Acteurs, organes, et mandats. Ne devrait pas trop poser de problèmes. On aura peut-être juste un petit souci pour garder les slugs de NosDeputes.

Il faudra intégrer ces données car les acteurs et organes (via leur ids open data)

Doc associée https://data.tricoteuses.fr/doc/assemblee/acteur.html
et https://data.tricoteuses.fr/doc/assemblee/organe.html

## Dossiers législatifs

Dossiers_Legislatifs_XVI_nettoye

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Dossiers_Legislatifs_XVI_nettoye

à creuser

Doc associée https://data.tricoteuses.fr/doc/assemblee/dossier.html

est-ce la même chose qu'une "section" dans nosdeputes ?

Contenu dans la db postgres par xsiType (en filtrant sur legislature 16):

    DossierIniativeExecutif_Type	6
    DossierLegislatif_Type	359
    DossierMissionControle_Type	15
    DossierResolutionAN	55

Très compliqué à comprendre, il faut lire la doc à fond

## Documents

documents_html_nettoye ?
https://git.en-root.org/tricoteuses/data/assemblee-nettoye/documents_html_nettoye

Doc associée https://data.tricoteuses.fr/doc/assemblee/document.html ?

est-ce la même chose qu'un "texteloi" dans nosdeputes ?

## Textes

https://git.en-root.org/tricoteuses/data/assemblee-textes

Doc associée https://data.tricoteuses.fr/doc/assemblee/texte.html#

je crois que là c'est les fichiers bruts html/pdf associés aux Documents

## Amendements

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Amendements_XVI_nettoye

Doc associée https://data.tricoteuses.fr/doc/assemblee/amendement.html

### Analyse dans la DB postgres des Tricoteuses

- 28257 amendements pour la legislature 16
- Pas d'autre legislature
- 27198 dans NosDeputes => OK ça correspond
- On va avoir un pb de correspondance d'id entre NosDeputes et les Tricoteuses. Tricoteuses expose plusieurs identifiants et numéros. Dans NosDeputes, il y a un "numero" mais qui à première vue ne correspond pas à un truc dans les Tricoteuses.

## Scrutins

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Scrutins_XVI_nettoye

Doc associée https://data.tricoteuses.fr/doc/assemblee/scrutin.html

### Analyse dans la DB postgres des Tricoteuses :

- 622 scrutins pour la legislature 16
- Pas d'autre legislature
- "numero" est une id de 1 à 622
- NosDeputes a 610 scrutins dans le dernier dump => OK ça correspond
- NosDeputes a aussi le champ numero. Ils utilisent aussi une "id" mais c'est exactement la même chose que le numero.

## Agendas ( = réunions/seance)

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Agenda_XVI_nettoye.git

Doc associée https://data.tricoteuses.fr/doc/assemblee/agenda.html

réunions ou séances publiques
(leur date, participants, etc. mais pas le contenu de ce qui a été dit ?)

### Analyse dans la DB postgres des Tricoteuses :

- dans la table reunions, en regardant leur `xsiType` on voit :
  - 206 seances. Que 129 si on filtre sur celles qui sont à l'AN (et non le Sénat) et qui ont le cycle de vie "confirmé"
  - 728 réunions de commissions. Dont 572 "confirmé".
  - 999 "reunionInitParlementaire_type" je sais pas ce que c'est
  - dans tout ça il n'y a pas de notion de législature (seulement les dates) donc peut-être que c'est mélangé entre les différentes législatures ?
- dans NosDeputes dans la table seance, en organisant par `type`, on a :
  - 96 seances en hemicycle => donc l'open data en a plus ???
  - 381 réunions de commissions => donc l'open data en a plus ???
  - => à creuser ...

## /!\ Données qui semblent manquer :(

Je ne vois aucune notion d'"intervention" (donc le contenu des séances...)

Elles sont super importantes pour nosdeputes... à creuser, c'est ptêt quand même qq part, dans l'open data de l'assemblée ?

Ces datasets de l'assemblée ont l'air bien :

https://data.assemblee-nationale.fr/travaux-parlementaires/debats
(semble bien contenir les interventions)

    Ce jeu fournit les comptes rendus de la séance publique pour la législature courante, et comprend les jours, dates, numéros de séance, les thèmes de discussion, l’ensemble des  orateurs (députés et ministres) et les textes des débats. 

https://data.assemblee-nationale.fr/travaux-parlementaires/questions

    Questions au gouvernements, orales et écrites. Je ne crois pas que NosDeputes les a, mais cela semble pertinent.

# Problématiques

## indicateurs des députés

# Autres liens rien à voir

Duralex
https://git.en-root.org/Seb35/duralex-js
(lien trouvé dans le forum, je le note car ça pourra être utile un jour)

    DuraLex is a grammar and a framework to convert legal modifying texts (like amendments and most bills articles) into an Abstract Syntax Tree – or more exactly a semantic tree – so that some automatic treatments become possible like creating diffs between the existing law and the proposed amended text.
