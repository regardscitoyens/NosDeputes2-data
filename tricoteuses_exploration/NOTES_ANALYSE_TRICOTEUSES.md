# Liens principaux

Les repos https://git.en-root.org/tricoteuses (le code + les données)

Le forum https://forum.en-root.org/ (contient quelques infos très utiles éparpillées)

Doc sur les différents schémas https://data.tricoteuses.fr/doc/index.html (indispensable !)

Le site data https://data.tricoteuses.fr/ plus à jour donc sans intérêt pour nous

La homepage https://tricoteuses.fr/ il y a des menus pour "voir" les jsons directement mais ça n'est pas très utilisable. Sans intérêt pour nous

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

Acteurs, organes, et mandats. Ne devrait pas trop poser de problèmes.

Doc associée https://data.tricoteuses.fr/doc/assemblee/acteur.html
et https://data.tricoteuses.fr/doc/assemblee/organe.html

## Dossiers législatifs

Dossiers_Legislatifs_XVI_nettoye

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Dossiers_Legislatifs_XVI_nettoye

à creuser

Doc associée https://data.tricoteuses.fr/doc/assemblee/dossier.html

est-ce la même chose qu'une "section" dans nosdeputes ?

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

probablement la même chose qu'un "amendement" dans nosdeputes ?

## Scrutins

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Scrutins_XVI_nettoye

Doc associée https://data.tricoteuses.fr/doc/assemblee/scrutin.html

probablement la même chose qu'un "scrutin" dans nosdeputes ?

## Agendas

Notion absente de nosdeputes, donc pas prio

## /!\ Données qui semblent manquer :(

Je ne vois aucune notion de

    - seance
    - intervention

Elles sont super importantes pour nosdeputes... à creuser, c'est ptêt quand même qq part, dans l'open data de l'assemblée ?

# Autres liens rien à voir

Duralex
https://git.en-root.org/Seb35/duralex-js
(lien trouvé dans le forum, je le note car ça pourra être utile un jour)

    DuraLex is a grammar and a framework to convert legal modifying texts (like amendments and most bills articles) into an Abstract Syntax Tree – or more exactly a semantic tree – so that some automatic treatments become possible like creating diffs between the existing law and the proposed amended text.
